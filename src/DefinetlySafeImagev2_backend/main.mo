import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import D "mo:base/Debug";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import SimpleEncrypt "simpleEncrypt";

actor ImageTransactionTracker {
  let ADMIN_INTERNET_IDENTITY : Text = "2361744";

  type Transaction = {
    sender : Principal;
    receiver : Principal;
    image : Blob;
    isLocked : Bool;
    passwordHash : Text;
  };

  var userTransactions : HashMap.HashMap<Principal, [Transaction]> = HashMap.HashMap<Principal, [Transaction]>((0, Principal.equal, Principal.hash));

  public query func isHaveTransactionHistory(sender : Principal) : async Bool {
    switch (userTransactions.get(sender)) {
      case (null) { return false };
      case (?transactionHistory) { return Array.size(transactionHistory) != 0 };
    };
  };

  public query func getAdminIdentity() : async Text {
    return ADMIN_INTERNET_IDENTITY;
  };

  public query func EnryptPassword(principalId : Text, passwordText : Text) : async Text {
    let encryptedPasswordResult = SimpleEncrypt.encryptPassword(principalId, passwordText);
    return encryptedPasswordResult;
  };

  public query func DecryptPassword(principalId : Text, encryptedText : Text) : async Text {
    let decryptedPasswordResult = SimpleEncrypt.decryptPassword(principalId, encryptedText);
    return decryptedPasswordResult;
  };

  public query func getUserTransactions(userId : Principal) : async [Transaction] {
    switch (userTransactions.get(userId)) {
      case (null) { return [] };
      case (?transactions) { return transactions };
    };
  };

  public shared (msg) func sendImage(callerId : Principal, imageReceiverId : Principal, image : Blob, isLocked : Bool, passwordHash : Text) : async () {

    D.print(debug_show (Principal.toText(callerId) # " --- sending image to --- :" # Principal.toText(imageReceiverId)));

    if (isLocked) {
      let encryptedPassword = await EnryptPassword(Principal.toText(callerId), passwordHash);
      var newTransaction : Transaction = {
        sender = callerId;
        receiver = imageReceiverId;
        image = image;
        isLocked = true;
        passwordHash = encryptedPassword;
      };

      let isHaveTransactionHistoryResult : Bool = await isHaveTransactionHistory(callerId);
      if (isHaveTransactionHistoryResult) {
        switch (userTransactions.get(callerId)) {
          case (null) { return };
          case (?transactionHistory) {
            let updatedTransactionHistory = Array.append<Transaction>(transactionHistory, [newTransaction]);
            userTransactions.put(callerId, updatedTransactionHistory);
          };
        };
      } else {
        userTransactions.put(callerId, [newTransaction]);
      };
    } else {
      var newTransaction : Transaction = {
        sender = callerId;
        receiver = imageReceiverId;
        image = image;
        isLocked = false;
        passwordHash = "";
      };

      let isHaveTransactionHistoryResult : Bool = await isHaveTransactionHistory(callerId);
      if (isHaveTransactionHistoryResult) {
        switch (userTransactions.get(callerId)) {
          case (null) { return };
          case (?transactionHistory) {
            let updatedTransactionHistory = Array.append<Transaction>(transactionHistory, [newTransaction]);
            userTransactions.put(callerId, updatedTransactionHistory);
          };
        };
      } else {
        userTransactions.put(callerId, [newTransaction]);
      };
    };
  };

  public func payTransactionFee() : async Bool {
    // Transaction fee mechanism to be implemented
    return true;
  };

  public query func debugUserTransaction() : async () {
    let entries = Iter.toArray(userTransactions.entries());
    D.print(debug_show ("userTransaction : ", entries));
  };

  public shared (msg) func receiveImage(senderId : Principal, receiverId : Principal, isLocked : Bool, password : Text) : async Blob {
    let emptyBlob = Blob.fromArray([]);
    let isHaveTransactionHistoryResult = await isHaveTransactionHistory(senderId);

    if (isHaveTransactionHistoryResult) {
      switch (userTransactions.get(senderId)) {
        case (null) { return emptyBlob };
        case (?resultTransactionArray) {
          let transactionHistory : [Transaction] = resultTransactionArray;

          if (isLocked) {
            let senderIdText = Principal.toText(senderId);
            let encryptedPasswordParam = await EnryptPassword(senderIdText, password);
            let lastElementIndex : Nat = Array.size(transactionHistory) - 1;
            let encryptedPassword = transactionHistory[lastElementIndex].passwordHash;

            if (encryptedPasswordParam == encryptedPassword) {
              D.print("Password is correct -- Locked Element receiving by :" # debug_show (receiverId) # " Last Element :" # debug_show (transactionHistory[lastElementIndex]));
              return transactionHistory[lastElementIndex].image;
            } else {
              D.print("Password is incorrect : " # debug_show (msg.caller));
              return emptyBlob;
            };
          } else {
            let lastElementIndex = Array.size(transactionHistory) - 1;
            let isNodeElementLockedInBlockChain = transactionHistory[lastElementIndex].isLocked;

            if (isNodeElementLockedInBlockChain) {
              D.print("Node Element Locked :" # debug_show (msg.caller));
              return emptyBlob;
            };

            D.print("Image Element receiving by :" # debug_show (receiverId) # " Last Element " # debug_show (transactionHistory[lastElementIndex]));
            return transactionHistory[lastElementIndex].image;
          };
        };
      };
    };

    return emptyBlob;
  };
};
