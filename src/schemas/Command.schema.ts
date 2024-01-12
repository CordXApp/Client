import { ISlashCommandProps } from 'src/types/utils.interface';

export class SlashBase {
  public props: ISlashCommandProps;

  constructor(props: ISlashCommandProps) {
    this.props = props;
  }
}