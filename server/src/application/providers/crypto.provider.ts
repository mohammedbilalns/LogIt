import bcrypt from "bcryptjs"
import { ICryptoProvider } from "../../domain/providers/crypto.provider.interface"

export class BcryptCryptoProvider implements ICryptoProvider {
    async hash(data: string , saltRounds: number) : Promise<string>{
        return await bcrypt.hash(data, saltRounds)
    }

    async compare(data: string, encrypted: string): Promise<boolean> {
        return await bcrypt.compare(data,encrypted)
    }
}