import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Brain,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
  BookOpen,
  Database,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { PageHeader } from '../../components/layout';

const SUBJECT_LEVELS = ['O-Level', 'AS-Level', 'A2-Level'];

export default function Training() {
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      subjectLevel: 'AS-Level',
      year: new Date().getFullYear()
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, batchesRes] = await Promise.all([
        apiClient.get('/api/training/stats'),
        apiClient.get('/api/training/batches?limit=50')
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (batchesRes.data?.success) {
        setBatches(batchesRes.data.data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // Don't show toast on initial load if no data yet - it's expected
      if (error.response?.status !== 500) {
        toast.error('Failed to load training data');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    
    if (!data.questionPdf?.[0] || !data.markschemePdf?.[0]) {
      toast.error('Both PDFs are required');
      return;
    }

    formData.append('questionPdf', data.questionPdf[0]);
    formData.append('markschemePdf', data.markschemePdf[0]);
    formData.append('paperCode', data.paperCode);
    formData.append('year', data.year);
    formData.append('session', data.session || '');
    formData.append('paperNumber', data.paperNumber || '');
    formData.append('subjectLevel', data.subjectLevel);

    setUploading(true);
    try {
      const response = await apiClient.post('/api/training/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('PDFs uploaded! Processing started...');
        reset();
        fetchData();
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteBatch = async (batchId) => {
    if (!confirm('Delete this batch and all its questions?')) return;
    
    try {
      await apiClient.delete(`/api/training/batch/${batchId}`);
      toast.success('Batch deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete batch');
    }
  };

  const reprocessBatch = async (batchId) => {
    try {
      await apiClient.post(`/api/training/batch/${batchId}/reprocess`);
      toast.success('Reprocessing started');
      fetchData();
    } catch (error) {
      toast.error('Failed to reprocess');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'extracting':
      case 'pairing':
      case 'mapping_topics': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const filteredBatches = selectedLevel === 'all' 
    ? batches 
    : batches.filter(b => b.subjectLevel === selectedLevel);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Training System"
        description="Upload past papers to train Mathius on authentic Edexcel questions"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black border-2 border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span className="text-white/70 text-sm">Total Questions</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalQuestions || 0}</p>
        </div>
        
        {SUBJECT_LEVELS.map(level => {
          const levelStats = stats?.byLevel?.find(s => s._id === level);
          return (
            <div key={level} className="bg-black border-2 border-white/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-white/70 text-sm">{level}</span>
              </div>
              <p className="text-3xl font-bold text-white">{levelStats?.totalQuestions || 0}</p>
              <p className="text-white/50 text-sm">
                {levelStats?.uniquePapersCount || 0} papers
              </p>
            </div>
          );
        })}
      </div>

      {/* Upload Form */}
      <div className="bg-black border-2 border-white/20 p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Past Paper
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Subject Level *</label>
              <select
                {...register('subjectLevel', { required: true })}
                className="w-full bg-black border-2 border-white/30 text-white p-3 focus:border-white focus:outline-none"
              >
                {SUBJECT_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Paper Code *</label>
              <input
                {...register('paperCode', { required: 'Paper code is required' })}
                placeholder="e.g., 4MA1/1H"
                className="w-full bg-black border-2 border-white/30 text-white p-3 placeholder-white/30 focus:border-white focus:outline-none"
              />
              {errors.paperCode && (
                <p className="text-red-400 text-sm mt-1">{errors.paperCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Year *</label>
              <input
                type="number"
                {...register('year', { required: true, min: 2000, max: 2030 })}
                className="w-full bg-black border-2 border-white/30 text-white p-3 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Session</label>
              <select
                {...register('session')}
                className="w-full bg-black border-2 border-white/30 text-white p-3 focus:border-white focus:outline-none"
              >
                <option value="">Select session</option>
                <option value="Jan">January</option>
                <option value="May">May/June</option>
                <option value="Oct">October</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Question Paper PDF *</label>
              <div className="border-2 border-dashed border-white/30 p-6 text-center hover:border-white/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  {...register('questionPdf', { required: 'Question PDF is required' })}
                  className="hidden"
                  id="questionPdf"
                />
                <label htmlFor="questionPdf" className="cursor-pointer">
                  <FileText className="w-10 h-10 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">Click to upload Question Paper</p>
                  <p className="text-white/50 text-sm mt-1">PDF only</p>
                </label>
              </div>
              {watch('questionPdf')?.[0] && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ {watch('questionPdf')[0].name}
                </p>
              )}
              {errors.questionPdf && (
                <p className="text-red-400 text-sm mt-1">{errors.questionPdf.message}</p>
              )}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Markscheme PDF *</label>
              <div className="border-2 border-dashed border-white/30 p-6 text-center hover:border-white/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  {...register('markschemePdf', { required: 'Markscheme PDF is required' })}
                  className="hidden"
                  id="markschemePdf"
                />
                <label htmlFor="markschemePdf" className="cursor-pointer">
                  <FileText className="w-10 h-10 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">Click to upload Markscheme</p>
                  <p className="text-white/50 text-sm mt-1">PDF only</p>
                </label>
              </div>
              {watch('markschemePdf')?.[0] && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ {watch('markschemePdf')[0].name}
                </p>
              )}
              {errors.markschemePdf && (
                <p className="text-red-400 text-sm mt-1">{errors.markschemePdf.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading & Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Train AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* Topic Distribution */}
      {stats?.topicsByLevel && Object.keys(stats.topicsByLevel).length > 0 && (
        <div className="bg-black border-2 border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Topic Distribution
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBJECT_LEVELS.map(level => (
              <div key={level} className="space-y-2">
                <h3 className="text-white/70 font-medium">{level}</h3>
                {stats.topicsByLevel[level]?.slice(0, 8).map(topic => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <span className="text-white/60 text-sm truncate">{topic.topic}</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 text-xs rounded">
                      {topic.count}
                    </span>
                  </div>
                )) || <p className="text-white/40 text-sm">No topics yet</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History */}
      <div className="bg-black border-2 border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload History
          </h2>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-black border-2 border-white/30 text-white p-2 text-sm focus:outline-none"
            >
              <option value="all">All Levels</option>
              {SUBJECT_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="p-2 border-2 border-white/30 text-white hover:border-white/60"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          <p className="text-white/50 text-center py-8">No uploads yet</p>
        ) : (
          <div className="space-y-3">
            {filteredBatches.map((batch) => (
              <div
                key={batch._id}
                className="border-2 border-white/10 hover:border-white/20 transition-colors"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedBatch(expandedBatch === batch._id ? null : batch._id)}
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-medium border ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {batch.paperCode} - {batch.year} {batch.session}
                      </p>
                      <p className="text-white/50 text-sm">{batch.subjectLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white">{batch.extractedQuestions} questions</p>
                      <p className="text-white/50 text-sm">{batch.pairedQuestions} paired</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {batch.status === 'failed' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); reprocessBatch(batch._id); }}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/10"
                          title="Reprocess"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBatch(batch._id); }}
                        className="p-2 text-red-400 hover:bg-red-400/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedBatch === batch._id ? (
                        <ChevronUp className="w-5 h-5 text-white/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/50" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedBatch === batch._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-4 bg-white/[0.02]"
                    >
                      <h4 className="text-white/70 text-sm font-medium mb-2">Processing Logs</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {batch.processingLogs?.map((log, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-white/70">[{log.stage}]</span>
                            <span className="text-white/50">{log.message}</span>
                          </div>
                        ))}
                      </div>
                      
                      {batch.processingError && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30">
                          <p className="text-red-400 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {batch.processingError}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

