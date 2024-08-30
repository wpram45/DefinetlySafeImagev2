import Text "mo:base/Text";

module simpleEncrypt {

    let secretKey = "dyhoacietrta";
    public func encryptPassword(principalText : Text, passwordText : Text) : Text {
        return principalText #passwordText #secretKey;
    };

    // Function to decrypt a password text
    public func decryptPassword(principalText : Text, encryptedPassword : Text) : Text {
        let principalRemoved = Text.trimStart(encryptedPassword, #text principalText);
        let finalDecryptedPassword = Text.trimEnd(principalRemoved, #text secretKey);
        return finalDecryptedPassword;

    };
};
