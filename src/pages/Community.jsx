import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

function Community() {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load posts when page opens
  useEffect(() => {
    loadPosts();
  }, []);

  // =========================
  // LOAD POSTS FROM FIREBASE
  // =========================
  const loadPosts = async () => {
    try {
      const postsRef = collection(db, "CommunityPosts");

      const postsQuery = query(
        postsRef,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(postsQuery);

      const postList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setPosts(postList);
      setLoading(false);

    } catch (error) {
      console.log("Error loading posts:", error);
      setLoading(false);
    }
  };

  // =========================
  // ADD POST TO FIREBASE
  // =========================
  const addPost = async () => {
    if (!postText.trim()) {
      alert("Please write something");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await addDoc(
        collection(db, "CommunityPosts"),
        {
          text: postText,
          userId: user.uid,
          userName: user.displayName || "Aura-H User",
          createdAt: Date.now(),
        }
      );

      setPostText("");

      alert("Post Added Successfully ❤️");

      loadPosts();

    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  // =========================
  // DELETE OWN POST
  // =========================
  const deletePost = async (postId, postUserId) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    if (user.uid !== postUserId) {
      alert("You can delete only your own post");
      return;
    }

    try {
      await deleteDoc(
        doc(db, "CommunityPosts", postId)
      );

      alert("Post Deleted");

      loadPosts();

    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-purple-100 p-6">

      {/* =========================
          HEADER
      ========================= */}

      <h1 className="text-4xl font-bold text-pink-600">
        👭 Community
      </h1>

      <p className="text-gray-600 mt-2">
        Share your thoughts and support other women 💖
      </p>

      {/* =========================
          CREATE POST
      ========================= */}

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 mt-8">

        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          ✍️ Share Something
        </h2>

        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Write something supportive..."
          className="w-full border border-pink-200 rounded-xl p-4 min-h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        <button
          onClick={addPost}
          className="w-full mt-4 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition"
        >
          ❤️ Post
        </button>

      </div>

      {/* =========================
          COMMUNITY POSTS
      ========================= */}

      <div className="max-w-3xl mx-auto mt-10">

        <h2 className="text-2xl font-bold text-pink-600 mb-5">
          🌸 Community Posts
        </h2>

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-6">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6">
            No posts yet. Be the first to share something! 💕
          </div>
        ) : (
          <div className="space-y-5">

            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >

                {/* USER DETAILS */}

                <div className="flex justify-between items-start">

                  <div>
                    <p className="font-bold text-pink-600">
                      👩 {post.userName}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      {post.createdAt
                        ? new Date(
                            post.createdAt
                          ).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {/* DELETE BUTTON */}

                  {auth.currentUser?.uid ===
                    post.userId && (
                    <button
                      onClick={() =>
                        deletePost(
                          post.id,
                          post.userId
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑 Delete
                    </button>
                  )}

                </div>

                {/* POST CONTENT */}

                <p className="text-lg mt-5 text-gray-700">
                  {post.text}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Community;