import * as Realm from 'realm-web';
import * as utils from './utils';

interface Bindings {
    REALM_APPID: string;
}

type Document = globalThis.Realm.Services.MongoDB.Document;

interface Product extends Document {
    name: string;
    purchased: boolean;
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectID;

const worker: ExportedHandler<Bindings> = {
    async fetch(req, env) {
        console.log('=================================================================')
        const url = new URL(req.url);
        App = App || new Realm.App(env.REALM_APPID);
        const method = req.method;
        const path = url.pathname.replace(/[/]$/, '');

        if (method === "OPTIONS") {
            return handleCors();
        }

        const token = req.headers.get('authorization') || 'CrmTZ7Eqsh4IHQmnrSZf8XwnhgWbwJEh29BaC67kF4zMtNfbkTvYM761v8IXXPOl';
        if (!token) return utils.toError('Missing "authorization" header.', 401);

        try {
            const credentials = Realm.Credentials.apiKey(token);
            var user = await App.logIn(credentials);
            var client = user.mongoClient('mongodb-atlas');
        } catch (err) {
            return utils.toError('Authentication error.', 500);
        }

        const collection = client.db('lista_zakupow').collection<Product>('lista');

        console.log('method ->', method)
        console.log('path ->', path)

        try {
            switch (path) {
                case '/api/products':
                    if (method === 'GET') {
                        // Get all products
                        return utils.reply(await collection.find({}));
                    } else if (method === 'POST') {
                        console.log('POST-> add product')
                        // Add a new product
                        const { name } = await req.json();
                        console.log(name)
                        return utils.reply(await collection.insertOne({
                            name,
                            purchased: false,
                        }));
                    }
                    else if (method === 'DELETE') {
                        console.log('DELETE')
                        // Delete a product
                        const id = url.searchParams.get('id');
                        console.log('id')
                        console.log(id)
                        return utils.reply(await collection.deleteOne({ _id: new ObjectId(id) }));
                    }
                    else if (method === 'PATCH') {
                        const id = url.searchParams.get('id');
                        const product = await collection.findOne({ _id: new ObjectId(id) });
                        return utils.reply(await collection.updateOne({ _id: new ObjectId(id) }, { $set: { purchased: !product.purchased } }));
                    }
                    break;
                default:
                    return utils.toError('Not Found', 404);
            }
        } catch (err) {
            console.log('err')
            console.log(err)
            const msg = (err as Error).message || 'Error with query.';
            return utils.toError(msg, 500);
        }

        console.log('????')
        return utils.toError('Method not allowed', 405);
    }
}
// Funkcja obsługująca żądania preflight CORS
function handleCors() {
    const headers = new Headers(utils.handleCorsHeaders);
    return new Response(null, { status: 204, headers });
}
export default worker;
