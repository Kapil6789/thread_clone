import { createSlice } from "@reduxjs/toolkit";

// helpers to normalize shapes (Prisma vs Mongo-like)
const normUser = (u) => {
  // ensure we always return an object to avoid e.admin._id crashes
  if (!u) return { _id: undefined, id: undefined, userName: undefined, username: undefined, profilePic: undefined };
  return {
    ...u,
    _id: u._id ?? u.id,
    id: u.id ?? u._id,
    userName: u.userName ?? u.username,
    username: u.username ?? u.userName,
  };
};

const normPost = (p) => {
  if (!p) return p;
  const admin = normUser(p.admin);
  const author = normUser(p.author);
  const comments = Array.isArray(p.comments)
    ? p.comments.map((c) => ({
        ...c,
        _id: c._id ?? c.id,
        id: c.id ?? c._id,
        admin: normUser(c.admin),
        author: normUser(c.author),
      }))
    : p.comments;
  const likes = Array.isArray(p.likes)
    ? p.likes.map((l) => ({
        ...l,
        _id: l._id ?? l.id,
        id: l.id ?? l._id,
        user: normUser(l.user),
      }))
    : p.likes;

  return {
    ...p,
    _id: p._id ?? p.id,
    id: p.id ?? p._id,
    admin,
    author,
    comments,
    likes,
  };
};

export const serviceSlice = createSlice({
  name: "service",
  initialState: {
    openAddPostModal: false,
    openEditProfileModal: false,
    anchorE1: null,
    anchorE2: null,
    darkMode: false,
    myInfo: {}, // default to object to avoid reading from null/undefined
    user: {},
    allPosts: [],
    postId: null,
    searchedUsers: [],
  },
  reducers: {
    addPostModal: (state, action) => {
      state.openAddPostModal = action.payload;
    },
    editProfileModal: (state, action) => {
      state.openEditProfileModal = action.payload;
    },
    toggleMainMenu: (state, action) => {
      state.anchorE1 = action.payload;
    },
    toggleMyMenu: (state, action) => {
      state.anchorE2 = action.payload;
    },
    toggleColorMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    addMyInfo: (state, action) => {
      // normalize me so components can use _id or id interchangeably
      state.myInfo = normUser(action.payload?.me || {});
    },
    addUser: (state, action) => {
      state.user = action.payload;
    },

    addSingle: (state, action) => {
      const incoming = action.payload?.newPost ?? action.payload?.post ?? action.payload;
      const newPost = normPost(incoming);
      const newArr = [newPost, ...state.allPosts.map(normPost)];
      const seen = new Set();
      const uniquePosts = newArr.filter((p) => {
        const key = p._id ?? p.id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      state.allPosts = uniquePosts;
    },
    addToAllPost: (state, action) => {
      const incoming = action.payload?.posts ?? action.payload?.allPost ?? [];
      const normalized = incoming.map(normPost);

      if (state.allPosts.length === 0) {
        state.allPosts = normalized;
        return;
      }
      const existingPosts = [...state.allPosts];
      normalized.forEach((p) => {
        const pid = p._id ?? p.id;
        const idx = existingPosts.findIndex((i) => (i._id ?? i.id) === pid);
        if (idx !== -1) existingPosts[idx] = p;
        else existingPosts.push(p);
      });
      state.allPosts = existingPosts;
    },
    deleteThePost: (state, action) => {
      const targetId = state.postId ?? action.payload?._id ?? action.payload?.id;
      state.allPosts = state.allPosts.filter((e) => (e._id ?? e.id) !== targetId);
    },
    addPostId:(state,action)=>{
      const val = action.payload;
      state.postId = typeof val === "object" ? (val?._id ?? val?.id ?? null) : val;
    },

    addToSearchedUsers: (state, action) => {
      state.searchedUsers = action.payload;
    },
  },
});

export const {
  addPostId,
  addPostModal,
  editProfileModal,
  toggleMainMenu,
  toggleMyMenu,
  toggleColorMode,
  addMyInfo,
  addUser,
  addSingle,
  addToAllPost,
  deleteThePost,
  addToSearchedUsers,
} = serviceSlice.actions;

export default serviceSlice.reducer;