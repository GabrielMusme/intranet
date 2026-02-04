// Definir los estados posibles de un Action
export enum ActionStatus {
    IDLE = "IDLE",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    SERVER_ERROR = "SERVER_ERROR"
}