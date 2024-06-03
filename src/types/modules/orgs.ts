import { Responses } from "../database"

export interface OrgMethod {
    create(opts: Options): Promise<Responses>
}

export interface Options {
    id?: string
    name?: string
    logo?: string
    banner?: string
    description?: string
    owner?: string
    api_key?: string
    verified?: boolean
    banned?: boolean
    domain?: string
    [key: string]: string | boolean | undefined
}