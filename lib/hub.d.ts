import connectionManager = require("./connection-manager");
import connection = require("./connection");
export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}
export interface API {
}
