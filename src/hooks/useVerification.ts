import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Result {
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadVerificationVideo: (file: File) => Promise<boolean>;
}

const extensionFor = (file: File) => {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split('/').pop() ?? 'bin';
};

export function useVerification(userId: string | null): Result {
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!userId) return null;
      const path = `${userId}/avatar.${extensionFor(file)}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) return null;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
      return avatarUrl;
    },
    [userId]
  );

  const uploadVerificationVideo = useCallback(
    async (file: File) => {
      if (!userId) return false;
      const path = `${userId}/verification.${extensionFor(file)}`;
      const { error } = await supabase.storage
        .from('verification-videos')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) return false;
      await supabase
        .from('profiles')
        .update({ verification_status: 'pending', verification_video_path: path })
        .eq('id', userId);
      return true;
    },
    [userId]
  );

  return { uploadAvatar, uploadVerificationVideo };
}
