if (!global.onlineUsersStore) {
  global.onlineUsersStore = {
    onlineUsers: [],
  };
}

const getOnlineUsers = () => global.onlineUsersStore.onlineUsers;

const addOnlineUser = (user) => {
  global.onlineUsersStore.onlineUsers.push(user);
};

const removeOnlineUserBySocketId = (socketId) => {
  const list = global.onlineUsersStore.onlineUsers;
  const index = list.findIndex((u) => u.socketId === socketId);
  if (index !== -1) list.splice(index, 1);
};

module.exports = {
  getOnlineUsers,
  addOnlineUser,
  removeOnlineUserBySocketId,
};
