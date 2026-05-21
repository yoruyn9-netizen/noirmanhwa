import React from 'react';

interface ProfileBannerViewProps {
  bannerURL: string | null | undefined;
}

const ProfileBannerView: React.FC<ProfileBannerViewProps> = ({ bannerURL }) => {
  return (
    <div className="w-full h-full">
      {bannerURL ? (
        <img src={bannerURL} className="w-full h-full object-cover" alt="User banner" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />
      )}
    </div>
  );
};

export default ProfileBannerView;
