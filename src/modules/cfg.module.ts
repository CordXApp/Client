import type CordX from "../client/cordx"
import { Responses } from "../types/database/index";
import { UserConfig } from "../types/database/users";
import { version } from "../../package.json";

export class ConfigModule {
    private client: CordX

    constructor(client: CordX) {
        this.client = client
    }

    public get sharex() {
        return {
            /**
             * Generate a users ShareX config (needed for using our Upload API)
             * @param user The user ID
             * @param secret The user secret
             * @param domain The domain to use for the config
             * @returns The generated ShareX config
             */
            generate: async (user: string, secret: string, domain?: string): Promise<Responses> => {

                if (!user) return { success: false, message: 'User ID is required' };
                if (!secret) return { success: false, message: 'Secret is required' };

                const config: UserConfig = {
                    Version: `${version}`,
                    Name: domain ? domain : 'cordximg.host',
                    DestinationType: 'ImageUploader, FileUploader',
                    RequestMethod: 'POST',
                    RequestURL: `${this.client.config.API.domain}/upload/sharex`,
                    Headers: {
                        userid: user,
                        secret: secret
                    },
                    Body: 'MultipartFormData',
                    FileFormName: 'sharex',
                    URL: '${json:url}'
                }

                return {
                    success: true,
                    message: 'Successfully generated your config!',
                    data: config
                };
            }
        }
    }
}
