import { Options } from "../../types/modules/orgs"
import { Responses } from "../../types/database"
import Logger from "../../utils/logger.util"
import type CordX from "../../client/cordx"

export class OrgModule {
    private client: CordX
    private logs: Logger

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger('Orgs')
    }

    public get functions() {
        return {
            validateOrgName: (opts: Options): Responses => {
                if (opts.owner !== '510065483693817867' && opts.name?.includes('cordx') || opts.name?.includes('CordX')) {
                    return {
                        success: false,
                        message: 'Unauthorized: you do not have permission to use this Org Name.'
                    };
                }
                return { success: true };
            },
            validateOrgOwner: async (opts: Options): Promise<Responses> => {
                const user = await this.client.db.user.model.fetch(opts.owner as string);

                if (!user.success) return {
                    success: false,
                    message: 'Hold up chief, you need to be a member of our services to do this!'
                }

                return { success: true };
            },
            checkOrgExists: async (name: string): Promise<Responses> => {
                const test = await this.client.db.prisma.orgs.findFirst({
                    where: { name },
                });

                if (test) return {
                    success: true,
                    message: 'Organization already exists!'
                }

                return { success: false }
            }


        }
    }
}