import { FastifyRequest, FastifyReply } from "fastify";
import { config as insertEnv } from "dotenv"
import Axios from "axios";

insertEnv()

export class UptimeRobot {
    constructor() { }

    public get Status() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
                let urlencoded = new URLSearchParams();
                urlencoded.append('api_key', `${process.env.UR_API_KEY}`);
                urlencoded.append('response_times', '1');
                urlencoded.append('custom_uptime_ratios', '7-30');
                urlencoded.append('Access-Control-Allow-Origin', '*');

                try {

                    let monitors = await Axios.post('https://api.uptimerobot.com/v2/getMonitors', urlencoded, {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'cache-control': 'no-cache'
                        }
                    });

                    let m = monitors.data.monitors;

                    for (let i in m) {
                        if (m[i].url !== undefined) {
                            delete m[i].url;
                        }
                    }

                    return res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(m));

                } catch (err: unknown) {
                    if (err instanceof Error) {
                        console.error(err);
                        return res.status(500).send({
                            status: 'STATUS_ERROR',
                            message: 'An error occurred while fetching our uptime robot status.',
                            error: err.message,
                            code: 500
                        })
                    }
                }
            }
        }
    }
}