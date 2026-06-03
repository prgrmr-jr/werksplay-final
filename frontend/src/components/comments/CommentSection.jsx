import {useState, useEffect} from "react";
import {getComments, postComment} from "../../api/comments";

export default function CommentSection({model, objectId}) {
    const [comments, setComments] = useState([]);
    const [author, setAuthor] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchComments = async () => {
        try {
            setFetching(true);
            const res = await getComments(model, objectId);
            setComments(res.data.results ?? res.data);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [model, objectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!author.trim() || !message.trim()) return;

        setLoading(true);
        try {
            await postComment({
                author_name: author,
                message,
                object_id: objectId,
                content_type_name: model,
            });

            setMessage("");
            fetchComments();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h3 className="font-game font-bold text-white uppercase tracking-wider text-sm">
                    COMMENTS
                </h3>

                <span className="text-white/30 text-xs">
          {comments.length} total
        </span>
            </div>

            {/* LIST */}
            <div className="space-y-3">

                {fetching ? (
                    <p className="text-white/30 text-sm">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-6">
                        No comments yet.
                    </p>
                ) : (
                    comments.map((c) => (
                        <div
                            key={c.id}
                            className="bg-navy-700 border border-white/5 rounded-lg p-4 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                <span className="text-cyan text-xs font-semibold">
                  {c.author_name}
                </span>

                                <span className="text-white/20 text-xs">
                  {new Date(c.created_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                  })}
                </span>
                            </div>

                            <p className="text-white/70 text-sm leading-relaxed">
                                {c.message}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-navy-700 border border-white/5 rounded-lg p-4 space-y-3"
            >
                <h4 className="text-white/40 text-xs uppercase tracking-wider">
                    Add Comment
                </h4>

                <input
                    className="input"
                    placeholder="Your name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    maxLength={100}
                />

                <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Write your comment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-cyan px-4 py-2 text-sm"
                    >
                        {loading ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </form>
        </div>
    );
}