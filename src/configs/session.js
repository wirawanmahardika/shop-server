import mysqlSession from 'express-mysql-session';

export default function sessionStoreMysql(session) {
    const MySQLStore = mysqlSession(session);
    const store = new MySQLStore({
        database: 'shop',
        checkExpirationInterval: 1000 * 3600 * 8,
        user: 'root',
        password: 'wirawan123',
        host: 'localhost',
        port: 3306,
        expiration: 1000 * 3600 * 24 * 4,
    });

    return store;
}
