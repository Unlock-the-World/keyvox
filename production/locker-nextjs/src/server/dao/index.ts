import {Knex, knex} from 'knex';
import Order from "@/server/dao/entity/order";
import {Model, PartialModelObject} from "objection";
import moment from "moment";

/**
 *
 */
class DaoHelper{

    private static instance: DaoHelper;

    private knexInstance: Knex | undefined;

    private constructor() {}

    /**
     * instance
     */
    public static getInstance(): DaoHelper {
        if (!DaoHelper.instance) {
            DaoHelper.instance = new DaoHelper();
        }
        if (!DaoHelper.instance.knexInstance){
            DaoHelper.instance.init();
        }
        return DaoHelper.instance;
    }

    /**
     *
     */
    private init(){
        const config: Knex.Config = {
            client: 'mysql',
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PWD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT? parseInt(process.env.DB_PORT): 3306,
            },
        };
        this.knexInstance = knex(config);
        Model.knex(this.knexInstance);
        return this.knexInstance;
    }

    /**
     * Query the order list based on the user ID.
     */
    public async  getOrderListByUserId(userId: string) {
       return await Order.query<Order>()
           .where('user_id', userId)
           .andWhere('status', '0')
           .andWhere('e_time', '>', moment().unix())
           .select().orderBy('e_time', 'desc');
    }

    /**
     *
     */
    public async getOrderById(id: number){
        return await Order.query<Order>().findById(id);
    }

    /**
     *
     * @param order
     */
    public async  saveOrder(order:  PartialModelObject<Order>){
        return await Order.query<Order>().insert(order);
    }

    /**
     *
     * @param id
     * @param order
     */
    public async updateOrder(order: PartialModelObject<Order>){
       return await Order.query<Order>()
           .update(order)
           .where('id', order.id!)
           .andWhere('user_id', order.userId!);
    }

}

export default DaoHelper;
