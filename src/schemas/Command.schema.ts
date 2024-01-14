import { ISlashCommandProps } from "src/types/commands"

export class SlashBase {
    public props: ISlashCommandProps

    constructor(props: ISlashCommandProps) {
        this.props = props
    }
}
