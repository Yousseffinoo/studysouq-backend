import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Check, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import { getAllImages, uploadImage, approveImage, rejectImage, deleteImage } from '../../../services/adminService';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, [page, statusFilter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getAllImages({ page, limit: 20, status: statusFilter });
      if (response.success) {
        setImages(response.data.images);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('image', files[0]);
    formData.append('title', files[0].name);
    formData.append('category', 'other');
    formData.append('subject', 'general');

    try {
      setUploading(true);
      await uploadImage(formData);
      toast.success('Image uploaded successfully');
      fetchImages();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveImage(id);
      toast.success('Image approved');
      fetchImages();
    } catch (error) {
      toast.error('Failed to approve image');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await rejectImage(id, reason || 'No reason provided');
      toast.success('Image rejected');
      fetchImages();
    } catch (error) {
      toast.error('Failed to reject image');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(id);
        toast.success('Image deleted');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Images Management</h1>
            <p className="text-[#94A3B8]">Upload and manage images for lessons and notes</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
            dragActive 
              ? 'border-[#2F6FED] bg-[#2F6FED]/10' 
              : 'border-white/20 bg-white/5 hover:border-white/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2F6FED]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#2F6FED]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Support for JPEG, PNG, GIF, SVG, WEBP (Max 5MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-[#94A3B8]">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#94A3B8]">
              No images found
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image._id}
                className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-white/5 overflow-hidden">
                  <img
                    src={`http://localhost:5000${image.url}`}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      image.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      image.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {image.status}
                    </span>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 truncate">{image.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
                    <span>{image.format?.toUpperCase()}</span>
                    <span>{Math.round(image.size / 1024)}KB</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {image.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(image._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(image._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {image.status !== 'pending' && (
                      <button
                        onClick={() => handleDelete(image._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Uploaded By */}
                  <p className="text-xs text-[#94A3B8] mt-3">
                    By: {image.uploadedBy?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors"
            >
              Previous
            </button>
            <span className="text-[#94A3B8]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

