import moment from "moment"

const COLOR_RED = "\x1b[31m"
const COLOR_GREEN = "\x1b[32m"
const COLOR_YELLOW = "\x1b[33m"
const COLOR_BLUE = "\x1b[34m"
const COLOR_MAGENTA = "\x1b[35m"
const COLOR_RESET = "\x1b[0m"

class Logger {
    public prefix?: string

    constructor(prefix?: string) {
        this.prefix = prefix
    }

    public info(message: string | object): void {
        console.info(
            `[${moment().format("DD/MM/YYYY HH:mm:ss")}] ${COLOR_BLUE}${this.prefix} | Info${COLOR_RESET} - ${message}`,
        )
    }

    public warn(message: string | object): void {
        console.warn(
            `[${moment().format("DD/MM/YYYY HH:mm:ss")}] ${COLOR_YELLOW}${this.prefix} | Warn${COLOR_RESET} - ${message}`,
        )
    }

    public error(message: string | object): void {
        console.error(
            `[${moment().format("DD/MM/YYYY HH:mm:ss")}] ${COLOR_RED}${this.prefix} | Error${COLOR_RESET} - ${message}`,
        )
    }

    public ready(message: string | object): void {
        console.log(
            `[${moment().format("DD/MM/YYYY HH:mm:ss")}] ${COLOR_GREEN}${this.prefix} | Success${COLOR_RESET} - ${message}`,
        )
    }

    public debug(message: string | object): void {
        console.debug(
            `[${moment().format("DD/MM/YYYY HH:mm:ss")}] ${COLOR_MAGENTA}${this.prefix} | Debug${COLOR_RESET} - ${message}`,
        )
    }
}

export default Logger