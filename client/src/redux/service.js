import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  addMyInfo,
  addSingle,
  addToAllPost,
  addUser,
  deleteThePost,
  addToSearchedUsers,
} from "./slice";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:5000/api/v1`,
    credentials: "include",
  }),
  keepUnusedDataFor: 60 * 60 * 24 * 7,
  tagTypes: ["Post", "User", "Me"],
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (data) => ({
        url: "/user/signin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Me"],
    }),
    login: builder.mutation({
      query: (data) => {
        // force server-compatible payload: it expects { username, password }
        const { email, username, password } = data || {};
        const identifier = (username || email || "").trim();
        return {
          url: "/user/login",
          method: "POST",
          body: { username: identifier, password },
        };
      },
      invalidatesTags: ["Me"],
    }),
    myInfo: builder.query({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
      providesTags: ["Me"],
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addMyInfo(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    logoutMe: builder.mutation({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
      invalidatesTags: ["Me"],
    }),
    userDetails: builder.query({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addUser(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    searchUsers: builder.query({
      query: (query) => ({
        url: `/user/search/${query}`,
        method: "GET",
      }),
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addToSearchedUsers(data.users || []));
        } catch (err) {
          console.log("Search error:", err);
          dispatch(addToSearchedUsers([]));
        }
      },
    }),
    followUser: builder.mutation({
      query: (id) => ({
        url: `/user/follow/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/user/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Me"],
    }),

    addPost: builder.mutation({
      query: (data) => ({
        url: `/post/addPost`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Post"],
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addSingle(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    allPost: builder.query({
      query: (page) => ({
        url: `/post?page=${page}`,
        method: "GET",
      }),
      providesTags: (result) => {
        return result && result.posts
          ? [
            ...result.posts.map(({ id }) => ({ type: "Post", id })),
            { type: "Post", id: "LIST" },
          ]
          : [{ type: "Post", id: "LIST" }];
      },
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addToAllPost(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    listPosts: builder.query({
      query: (page) => ({
        url: `/post?page=${page}`,
        method: "GET",
      }),
      providesTags: (result) => {
        return result && result.posts
          ? [
            ...result.posts.map(({ id }) => ({ type: "Post", id })),
            { type: "Post", id: "LIST" },
          ]
          : [{ type: "Post", id: "LIST" }];
      },
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addToAllPost(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/post/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(deleteThePost(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    likePost: builder.mutation({
      query: (id) => ({
        url: `/post/like/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
    }),
    singlePost: builder.query({
      query: (id) => {
        if (!id || id === 'undefined' || id === undefined) {
          throw new Error('Post ID is required');
        }
        return {
          url: `/post/${id}`,
          method: "GET",
        };
      },
      providesTags: (result, error, id) => {
        if (!id || id === 'undefined' || id === undefined) return [];
        return [{ type: "Post", id }];
      },
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addSingle(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    repost: builder.mutation({
      query: (id) => ({
        url: `/post/repost/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    addComment: builder.mutation({
      query: ({ postId, text }) => {
        console.log("Redux service - addComment called with:", { postId, text });
        return {
          url: `/comments/addComment/${postId}`,
          method: 'POST',
          body: { text },
        };
      },
      invalidatesTags: ['Post', 'Comment'],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, id }) => ({
        url: `/comments/deleteComment/${postId}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'Comment'],
    }),
  }),
});

export const {
  useSigninMutation,
  useLoginMutation,
  useMyInfoQuery,
  useLogoutMeMutation,
  useUserDetailsQuery,
  useLazySearchUsersQuery,
  useAllPostQuery,
  useListPostsQuery,
  useFollowUserMutation,
  useAddCommentMutation,
  useAddPostMutation,
  useDeleteCommentMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useRepostMutation,
  useSinglePostQuery,
  useUpdateProfileMutation,
} = serviceApi;