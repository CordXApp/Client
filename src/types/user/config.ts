export interface UserConfig {
    Version: string;
    Name: string;
    DestinationType: string;
    RequestMethod: string;
    RequestURL: string;
    Headers: {
        userid: string;
        secret: string;
    },
    Body: string;
    FileFormName: string;
    URL: string;

}