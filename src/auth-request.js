'use strict'

import KeyEncoder from 'key-encoder'
import { TokenSigner, decodeToken } from 'jwt-js'
import { secp256k1 } from 'elliptic-curve'
import uuid from 'node-uuid'

export class AuthRequest {
    constructor(privateKey) {
        this.privateKey = privateKey
        this.keyEncoder = new KeyEncoder('secp256k1')
        this.publicKey = secp256k1.getPublicKey(privateKey)
        this.tokenSigner = new TokenSigner('ES256k', privateKey)
        this.issuer = { publicKey: this.publicKey }
        this.provisions = [
            { action: 'sign', data: uuid.v4() },
            { action: 'disclose', scope: 'username' }
        ]
    }

    setIssuer(issuer) {
        const newIssuer = this.issuer
        for (let attrname in issuer) {
            newIssuer[attrname] = issuer[attrname]
        }
        this.issuer = newIssuer
    }

    setProvisions(provisions) {
        this.provisions = provisions
    }

    payload() {
        return {
            issuer: this.issuer,
            issuedAt: new Date().getTime(),
            provisions: this.provisions
        }
    }

    sign() {
        return this.tokenSigner.sign(this.payload())
    }
}