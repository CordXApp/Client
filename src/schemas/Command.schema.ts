import { ISlashCommandProps } from "src/types/client/commands"

export class SlashBase {
    public props: ISlashCommandProps

    constructor(props: ISlashCommandProps) {
        this.props = props
    }
}
