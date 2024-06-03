import { PartnerMethods, Responses } from "../../../types/database/index"
import type CordX from "../../../client/cordx";

export class PartnerClient {
    private client: CordX;

    constructor(client: CordX) {
        this.client = client;
    }

    public get model(): PartnerMethods {
        return {
            list: async (): Promise<Responses> => {
                const partners = await this.client.db.prisma.partners.findMany();

                if (!partners) return { success: false, message: 'No partners found, oh the sadness!' }

                return { success: true, data: partners }
            }
        }
    }
}
