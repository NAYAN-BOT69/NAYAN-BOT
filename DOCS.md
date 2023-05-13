### **🛠️ Built-in Functions:**
* Translate
* convertTime
* enable/disable process.stderr.clearLine
* getExtFromMimeType
* getTime
* jsonStringifyColor
* randomString/Number
* findUid Facebook
* getStreamsFromAttachment
* getStreamFromURL
* Google Drive: (upload, delete, getFile, etc...)
* And more...<br />
See [utils.js](https://github.com/NAYAN-BOT69/NAYAN-BOT/blob/main/utils.js) for more details.

<hr>

### **🧠 Prepare**
- [Node.js](https://nodejs.org/en/download/) 16.x
- IDE or Text Editor (VSCode, Sublime Text, Atom, Notepad++, ...)
- Knowledge of Javascript, Node.js, JSON,...


<hr>

### **💾 Database**

#### Type: You can choose one of the following storage methods, config at [config.json](https://github.com/NAYAN-BOT69/NAYAN-BOT/blob/main/config.json)
* [JSON](https://www.json.org/json-en.html) or [SQLite](https://www.sqlite.org/) or [MONGODB](https://www.mongodb.com/docs/manual/core/document/)
* Basic usages:<br />

<details>
	<summary>
		<b><i>Users</i></b>
	</summary>
	<i>see more details at <a href="https://github.com/NAYAN-BOT69/NAYAN-BOT/blob/main/database/controller/usersData.js">usersData.js</a></i>
	<br />
	<br />

```javascript
// CREATE USER DATA
const newUserData = await usersData.create(userID, userInfo);
// userInfo is data get by (await api.getUserInfo(userID))[userID] method or undefined is auto

// GET USER DATA
const userData = await usersData.get(userID);
```


```javascript
// SET USER DATA
await userData.set(userID, updateData, path);


// Example 1
//   set data with path
await usersData.set(4, { banned: true }, "data");

//   set data without path
const userData = await usersData.get(userID);
userData.data = {
	banned: true
};
await usersData.set(4, {
	data: userData.data
});

// Example 2
// set data with path
await usersData.set(4, {
	name: "ABC",
	birthday: "01/01/1999"
}, "data.relationship.lover");

// set data without path
const userData = await usersData.get(userID);
userData.data.relationship.lover = {
	name: "ABC",
	birthday: "01/01/1999"
};
await usersData.set(4, {
	data: userData.data
});
```

```javascript
// GET ALL USER DATA
const allUsers = await usersData.getAll();

// GET USER NAME
const userName = await usersData.getName(userID);

// GET USER AVATAR URL
const avatarUrl = await usersData.getAvatarUrl(userID);

// REFRESH INFO USER
await usersData.refreshInfo(userID, updateData);
// updateData is data get by api.getUserInfo(userID)[userID] method or undefined is auto 
// refresh data gender, name, vanity of the user 

// REMOVE USER DATA
await usersData.remove(4);
```
</details>


<details>
	<summary>
		<b><i>Threads</i></b>
	</summary>
	<i>see more details at <a href="https://github.com/NAYAN-BOT69/NAYAN-BOT/blob/main/database/controller/threadsData.js">threadsData.js</a></i>
	<br />
	<br />

```javascript
// CREATE THREAD DATA
const newThreadData = await threadsData.create(threadID, threadInfo);
// threadInfo is data get by api.getThreadInfo() method or undefined is auto

// GET THREAD DATA
const threadData = await threadsData.get(threadID);

// GET ALL THREAD DATA
const allThreads = await threadsData.getAll();

// GET THREAD NAME
const threadData = await threadsData.get(threadID);
const threadName = threadData.threadName;
```

```javascript
// SET THREAD DATA
await threadsData.set(threadID, updateData, path);


// Example 1
// set data with path
await threadsData.set(2000000000000000, "Helo", "data.welcomeMessage");

// set data without path
const threadData = await threadsData.get(2000000000000000);
threadData.data.welcomeMessage = "Hello";
await threadData.set(2000000000000000, {
	data: threadData.data
});
```

```javascript
// REFRESH THREAD DATA
await threadsData.refreshInfo(threadID, threadInfo);
// threadInfo is data get by api.getThreadInfo(threadID) method or undefined is auto 
// refresh data threadName, threadThemeID, emoji, adminIDs, imageSrc and members of thread
```
</details>
<hr>


	

## 🚀 **Updating...**
