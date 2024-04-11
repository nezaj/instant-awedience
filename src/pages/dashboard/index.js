import React, { useState, useEffect, useRef } from "react"
import { init, useAuth, id, tx } from "@instantdb/react"
import Login from "@/components/Login"
import PartyTime from "@/components/partytime"

const db = init({ appId: "d7e379b9-9744-4ba1-a7d4-4b022080338d" })
const room = db.room("main", '123');

// Helpers
// ----------------------
function stringToColor(str) {
  // A simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert hash to a color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

function typingInfo(users) {
  console.log("HERE", users)
  if (users.length === 0) return null;
  if (users.length === 1) return `${users[0].email} is typing...`;
  if (users.length === 2)
    return `${users[0].email} and ${users[1].email} are typing...`;

  return `${users[0].email} and ${users.length - 1} others are typing...`;
}

// Mutations
// ----------------------
function addComment({ user, text }) {
  db.transact(tx.comments[id()].update({
    creatorEmail: user.email,
    text,
    createdAt: new Date().toISOString()
  }))
}

function deleteComments(comments) {
  const txs = comments.map((comment) => tx.comments[comment.id].delete(comment))
  db.transact(txs)
}

function Comment({ comment }) {
  const { creatorEmail, text } = comment
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg flex flex-col border-black/5 border">
        <div className="flex gap-2 p-4 py-2 items-center">
          <div className="rounded-full overflow-hidden bg-gray-100 w-6 h-6 flex-none" style={{ backgroundColor: stringToColor(creatorEmail) }} />
          <div className="flex flex-col justify-center flex-1 gap-0.5">
            <span className="text-black text-sm">
              <span className="text-black text-sm font-semibold inline">{creatorEmail}</span>
            </span>
          </div>
        </div>
        <div className="bg-neutral-100 h-px" />
        <div className="p-4 flex flex-col gap-3">
          <span className="text-black text-sm">{text}</span>
        </div>
      </div>
    </div>
  )
}

function CommentThread({ user, comments }) {
  const [text, setText] = useState("");
  const commentsRef = useRef(null);
  const scrolledManuallyRef = useRef(false);

  useEffect(() => {
    // Scroll to bottom if not scrolled manually when comments update
    if (commentsRef.current && !scrolledManuallyRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  const onScroll = () => {
    if (commentsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = commentsRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      scrolledManuallyRef.current = !isAtBottom;
    }
  };

  const onKeyDown = (e, indicatorFn) => {
    indicatorFn(e);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addComment({ user, text });
    setText("");
  };

  const handleClear = (comments) => {
    deleteComments(comments);
  };

  room.useSyncPresence(user);
  const typing = room.useTypingIndicator('comment');
  console.log("TYPING", typing)

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div
        ref={commentsRef}
        className="flex-1 overflow-y-scroll space-y-4"
        onScroll={onScroll}
      >
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} />
        ))}
      </div>
      <div className="bg-neutral-100 -mx-4 h-0.5" />
      <div className="flex flex-col gap-4">
        <div className="flex-none rounded-lg flex flex-col border-black/5 border">
          <div className="flex gap-2 p-4 py-2 items-center">
            <div
              className="rounded-full overflow-hidden bg-gray-100 w-6 h-6 flex-none"
              style={{ backgroundColor: stringToColor(user.email) }}
            />
            <div className="flex flex-col justify-center flex-1 gap-0.5">
              <span className="text-black text-sm font-semibold inline">
                Add a comment
              </span>
            </div>
          </div>
          <div className="bg-neutral-100 h-px" />
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onBlur={typing.inputProps.onBlur}
              onKeyDown={(e) => onKeyDown(e, typing.inputProps.onKeyDown)}
              onChange={(e) => setText(e.target.value)}
              className="box-border block w-full rounded-md border-0 px-4 py-2 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 sm:leading-6 border-none text-sm ring-0"
              placeholder="Write..."
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
            <div className="truncate text-xs text-gray-500">
              {typing.active.length ? typingInfo(typing.active) : <>&nbsp;</>}
            </div>
          </form>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex justify-center flex-1">
            <PartyTime />
          </div>
          <div className="space-x-4">
            <button
              onClick={handleSubmit}
              className="appearance-none border-0 font-bold rounded-md cursor-pointer px-3.5 py-2.5 text-sm bg-violet-500 hover:bg-violet-400 text-white shadow-sm"
            >
              Post
            </button>
            <button
              onClick={() => handleClear(comments)}
              className="appearance-none border-0 font-bold rounded-md cursor-pointer px-3.5 py-2.5 text-sm bg-pink-500 hover:bg-pink-400 text-white shadow-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard
// ----------------------
function Main({ user }) {
  const { isLoading, error, data } = db.useQuery({ comments: {} })
  if (isLoading) {
    return <div>Fetching data...</div>
  }
  if (error) {
    return <div>Error fetching data: {error.message}</div>
  }
  return (
    <div>
      <div className="flex flex-row flex-1 h-screen">
        <div className="p-8 flex flex-col flex-1 justify-end">
          <CommentThread user={user} comments={data.comments} />
        </div>
      </div>
    </div>
  )
}

// App
// ----------------------
function App() {
  const { isLoading, user, error } = useAuth(db)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (user) return <Main user={user} />
  return <Login />
}

export default App
