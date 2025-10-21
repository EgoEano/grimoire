// Можно прямо в любом .ts, если не хочется отдельного файла
import type { Request } from "express";
import type { ModJwtPayload } from "./tokenTypes";


declare global {
    namespace Express {
        interface Request {
            user?: ModJwtPayload | null | undefined;
        }
    }
}
