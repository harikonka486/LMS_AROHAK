import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'mysql2/promise';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private db;
    constructor(config: ConfigService, db: Pool);
    validate(payload: {
        id: string;
    }): Promise<any>;
}
export {};
