export interface IEvent {
    props: IEventBaseProps
    execute: (...args: unknown[]) => void
}

export interface IEventBaseProps {
    name: string
    once?: boolean
}

export const SubCommandOptions = {
    SubCommand: 1,
    SubCommandGroup: 2,
    String: 3,
    Integer: 4,
    Boolean: 5,
    User: 6,
    Channel: 7,
    Role: 8,
    Mentionable: 9,
    Number: 10,
    Attachment: 11,
}

export interface IStatusCommand {
    success: boolean
    response: {
        available: boolean
        started: string
        ended: string
        responseTime: number
        roundTrip: number
    }
}
