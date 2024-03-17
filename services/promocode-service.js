const crypto = require('crypto');
const config = require('../config.json');
const algorithm = config.aes256.algorithm;
const key = crypto.createHash('sha256').update(String(config.aes256.key)).digest('base64').substr(0, 32);
const iv = Buffer.from(config.aes256.iv, 'hex');

class PromocodeService {

    async generatePromocode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.randomBytes(length);
        const result = new Array(length);

        for (let i = 0; i < length; i++) {
            result[i] = chars[bytes[i] % chars.length];
        }

        return result.join('');
    }

    async encryptPromocode(promocode) {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
    
        let encrypted = cipher.update(promocode, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    async decryptPromocode(encryptedPromocode) {
        const [ivHex, ciphertext] = encryptedPromocode.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

}

module.exports = new PromocodeService();
