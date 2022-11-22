import { join } from "path";
import { AsymmetricSignatureConfig, SymmetricSignatureConfig } from "../src";

export const payload = `{"detectionTimestamp":1668171698000,"event":{"mmr":{"found":true,"make":"Ford","makeConfidence":100,"model":"Focus","modelConfidence":100,"category":"CAR","categoryConfidence":100,"color":"#000","colorConfidence":100,"heading":"front","headingConfidence":100},"plate":{"found":true,"unicodeText":"JST052","country":"HUN","state":null,"confidence":100}},"attachments":[{"mimeType":"image/jpeg","data":"sampledata"}]}`;
export const RS256 = {
    invalidSignature: "I'm invalid!",
    validSignature: "d2ezgBLo9qqso9sHCEzNIU90NsixNuYRR191aHmbDN17RKUntE1_p8yc1AHa1_0N57wDA03AbnpaoBffrYEA96-FHq7-pZtji4HDhnZpOuecVKDykH-go8To5hpSeYUfulryiLlq-R5d-lrcdI7qoBylVz4C7loCmWk9TJhJi4gtrJDOGZKC492EOPtvVXYv-88Y5XcPhcJvk63W5Y3v2Z9jk1JvY8TzX6X9bzoF88bzG70LzNEMQ8muUS2fx5sXxmJUxsGHJNCVbMYyqy9g4uFl1DmyOR8ZmX5ztbvmPq8GOenn6bDgn_VjTQI21o_1bB_Hz4TkTwA75kJXpLOwn3Jf8XRmiSyxd0cmBiv4n5LVJSsYQI8eH6HcZrnZrerVI3f8tipI13RePu2oMUpqdQON-7ekTYvgmcm5xZKAc4Tvynnu6_Yb6CALa7lsOhUh5elXoV4tXxquMm8pMWD2yb_5VdimzHs17CybFCaMjOxBSvsfs5VYPn-b6OBRmFIXhF-lhTTEVYgYdjbYGxhYWfr14Qhu2Bvpr5yx8_tXOL2shVXdUbqTTHstNk62RmOlPaIu58AN8W18uhUQc_-KoAT9iSKnUz6D2fbFwbA4r2FglCMSfsEcI8o_Z6JlHxNlJCnX7TX9Go2xmeYdc-GT8_91fHhb2xo1wMdJrduktZI",
    options: {
        algorithm: "RS256",
        publicKeyPath: join(__dirname, "RS256.public.pem")
    } as AsymmetricSignatureConfig
};
export const HS256 = {
    invalidSignature: "I'm invalid!",
    validSignature: "QoduozBbK9CzEvzK0OuioqKjkbOqzV6EaQJpBF6xbKo",
    options: {
        algorithm: "HS256",
        secret: "TEST HMAC SECRET"
    } as SymmetricSignatureConfig
}