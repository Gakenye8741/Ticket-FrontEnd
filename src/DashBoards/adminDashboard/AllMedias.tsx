import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  useGetAllMediaQuery,
  useCreateMediaMutation,
  useDeleteMediaMutation,
} from '../../features/APIS/mediaApi';
import { eventApi } from '../../features/APIS/EventsApi';

interface Event {
  eventId: number;
  title: string;
}

interface Media {
  mediaId: number;
  eventId: number;
  type: 'image' | 'video';
  url: string;
  uploadedAt: string;
  altText?: string;
}

const AllMedia: React.FC = () => {
  const { data: mediaList, isLoading, isError } = useGetAllMediaQuery(undefined);
  const { data: events = [] } = eventApi.useGetAllEventsQuery({});
  const [createMedia, { isLoading: isCreating }] = useCreateMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets';

  const [eventId, setEventId] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !eventId || !type) {
      Swal.fire('Missing Info', 'Please provide all required fields.', 'warning');
      return;
    }

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', preset_key);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/${type}/upload`,
        cloudFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percent);
          },
        }
      );

      const url = response.data.secure_url;

      await createMedia({
        eventId: Number(eventId),
        type,
        url,
      }).unwrap();

      setEventId('');
      setType('image');
      setFile(null);
      setUploadProgress(0);
      setIsModalOpen(false);

      Swal.fire('Success', 'Media uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to upload media.', 'error');
    }
  };

  const handleDelete = async (mediaId: number) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This media will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteMedia(mediaId).unwrap();
        Swal.fire('Deleted!', 'Media has been deleted.', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete media.', 'error');
      }
    }
  };

  const getEventName = (id: number): string => {
    const match = events.find((event: Event) => event.eventId === id);
    return match?.title || `Event ${id}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} @ ${timePart}`;
  };

  return (
    <div className="p-4 bg-cover  p-6  bg-gray-900 text-white " >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">📸 All Media</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          Add Media
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-300">Loading media...</p>
      ) : isError ? (
        <p className="text-red-600">❌ Failed to load media.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList?.map((media: Media) => (
            <div
              key={media.mediaId}
              className="bg-blue-950/60 backdrop-blur-md border border-blue-800 rounded-xl shadow p-4 text-white flex flex-col justify-between"
            >
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.altText || 'Media'}
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <video controls className="w-full h-48 rounded">
                  <source src={media.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="mt-3 text-sm leading-relaxed space-y-1">
                <p>
                  <span className="font-semibold text-white">📽️ Type:</span>{' '}
                  <span className="capitalize text-amber-300">{media.type}</span>
                </p>
                <p>
                  <span className="font-semibold text-white">🎟️ Event:</span>{' '}
                  <span className="text-cyan-300">{getEventName(media.eventId)}</span>
                </p>
                <p>
                  <span className="font-semibold text-white">⏰ Uploaded:</span>{' '}
                  <span className="text-gray-400">{formatDate(media.uploadedAt)}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
                  title="Edit (Not implemented)"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  onClick={() => handleDelete(media.mediaId)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md text-white w-full max-w-lg rounded-xl p-6 relative shadow-lg">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-white hover:text-red-400"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">Upload New Media</h3>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full bg-transparent border p-2 rounded text-white"
                required
              >
                <option value="">Select Event</option>
                {events.map((event: Event) => (
                  <option
                    key={event.eventId}
                    value={event.eventId}
                    className="text-black"
                  >
                    {event.title}
                  </option>
                ))}
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'image' | 'video')}
                className="w-full bg-transparent border p-2 rounded text-white"
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              <input
                type="file"
                accept={type === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full file:mr-2 file:py-2 file:px-4 file:rounded file:border-none file:bg-blue-600 file:text-white"
                required
              />

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded h-4">
                  <div
                    className="bg-blue-600 h-4 rounded text-xs text-white text-center"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
              >
                {isCreating ? 'Uploading...' : 'Upload Media'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMedia;
