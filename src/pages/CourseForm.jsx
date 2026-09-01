import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

const CourseForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: '',
    platform: '',
    title: '',
    price: '',
    duration: '',
    lessons: 0,
    level: 'Beginner',
    thumbnail: '',
    description: '',
    videoUrl: '',
    videos: [],
  });

  const [newVideo, setNewVideo] = useState({ title: '', duration: '', link: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const platRes = await API.get('/admin/platforms');
        if (platRes.data.success) {
          setPlatforms(platRes.data.data.filter((p) => p.isActive));
        }

        if (isEdit) {
          const { data } = await API.get(`/courses/${id}`);
          if (data.success) {
            const c = data.data;
            setForm({
              id: c.id,
              platform: c.platform,
              title: c.title,
              price: c.price,
              duration: c.duration || '',
              lessons: c.lessons || 0,
              level: c.level || 'Beginner',
              thumbnail: c.thumbnail || '',
              description: c.description || '',
              videoUrl: c.videoUrl || '',
              videos: c.videos || [],
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addVideo = () => {
    if (!newVideo.title || !newVideo.link) {
      toast.error('Video title and link are required');
      return;
    }
    const video = {
      id: `vid-${Date.now()}`,
      ...newVideo,
    };
    setForm((prev) => ({
      ...prev,
      videos: [...prev.videos, video],
      lessons: prev.videos.length + 1,
    }));
    setNewVideo({ title: '', duration: '', link: '' });
  };

  const removeVideo = (videoId) => {
    setForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== videoId),
      lessons: prev.videos.length - 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        lessons: form.videos.length,
      };

      if (isEdit) {
        await API.put(`/admin/courses/${id}`, payload);
        toast.success('Course updated');
      } else {
        await API.post('/admin/courses', payload);
        toast.success('Course created');
      }
      navigate('/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Edit Course' : 'Create New Course'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course ID (slug)</label>
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                disabled={isEdit}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                placeholder="amz-fba-mastery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select platform</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Amazon FBA Mastery"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="4h 20m"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Videos ({form.videos.length})
          </h2>

          {/* Existing videos */}
          {form.videos.length > 0 && (
            <div className="space-y-3">
              {form.videos.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-400 w-6">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.title}</p>
                    <p className="text-xs text-gray-500">{v.duration} • {v.link}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(v.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add video form */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Add Video</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="Video title"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                value={newVideo.duration}
                onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                placeholder="Duration (e.g. 18m)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                value={newVideo.link}
                onChange={(e) => setNewVideo({ ...newVideo, link: e.target.value })}
                placeholder="Video URL"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={addVideo}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
