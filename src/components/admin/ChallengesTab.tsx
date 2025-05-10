import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ChallengeForm from './ChallengeForm';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'streak' | 'goal';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  requirements: {
    target: number;
    metric: string;
    timeframe?: string;
  };
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  completion_rate: number;
}

interface ChallengeParticipant {
  id: string;
  user: {
    username: string;
    full_name: string;
    email: string;
  };
  progress: {
    current: number;
  };
  completed: boolean;
  completion_date: string | null;
  streak_count: number;
}

const ChallengesTab: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      fetchParticipants(selectedChallenge);
    }
  }, [selectedChallenge]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');

      if (error) throw error;

      const challengesWithStats = await Promise.all(data.map(async (challenge) => {
        const { count: totalParticipants } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact' })
          .eq('challenge_id', challenge.id);

        const { count: completedParticipants } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact' })
          .eq('challenge_id', challenge.id)
          .eq('completed', true);

        return {
          ...challenge,
          participants_count: totalParticipants || 0,
          completion_rate: totalParticipants ? (completedParticipants! / totalParticipants) * 100 : 0
        };
      }));

      setChallenges(challengesWithStats);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchParticipants = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:profiles(username, full_name, email)
        `)
        .eq('challenge_id', challengeId);

      if (error) throw error;
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleCreateChallenge = async (data: Partial<Challenge>) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .insert([data]);

      if (error) throw error;

      setShowForm(false);
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleUpdateChallenge = async (data: Partial<Challenge>) => {
    try {
      if (!editingChallenge?.id) return;

      const { error } = await supabase
        .from('challenges')
        .update(data)
        .eq('id', editingChallenge.id);

      if (error) throw error;

      setShowForm(false);
      setEditingChallenge(null);
      fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || challenge.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || challenge.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && challenge.is_active) ||
                         (statusFilter === 'inactive' && !challenge.is_active);
    
    return matchesSearch && matchesType && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Challenge Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="streak">Streak</option>
          <option value="goal">Goal</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Challenges Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Challenge</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Difficulty</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Participants</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Completion</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredChallenges.map((challenge) => (
              <tr key={challenge.id}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium dark:text-white">{challenge.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{challenge.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize text-gray-900 dark:text-white">{challenge.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === 'beginner'
                      ? 'bg-green-100 text-green-800'
                      : challenge.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  {challenge.participants_count}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${challenge.completion_rate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {Math.round(challenge.completion_rate)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    challenge.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {challenge.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingChallenge(challenge);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Edit className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this challenge?')) {
                          handleDeleteChallenge(challenge.id);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Challenge Form Modal */}
      {showForm && (
        <ChallengeForm
          challenge={editingChallenge}
          onSubmit={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}
          onClose={() => {
            setShowForm(false);
            setEditingChallenge(null);
          }}
        />
      )}
    </div>
  );
};

export default ChallengesTab;