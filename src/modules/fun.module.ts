import type CordX from "../client/cordx"
import { FunClient, Response, EightBallMessages } from "../types/modules/fun";

export class FunModule implements FunClient {
    private client: CordX

    constructor(client: CordX) {
        this.client = client
    }

    public get generate() {
        return {
            EightBall: async () => {
                const results = await EightBallMessages[Math.floor(Math.random() * EightBallMessages.length)]

                return results;
            },
            Advice: async () => {
                const results = await fetch('https://api.adviceslip.com/advice')
                    .then((res: any) => res.json())
                    .then((data: any) => data)
                    .catch((e: Error) => this.client.logs.error(`Error fetching advice: ${e.stack}`))

                return results.slip.advice
            }
        }
    }
}
