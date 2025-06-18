import React from 'react';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';
import { formatDate } from './utils/profileHelpers';

const SubscriptionSection = ({ profileData }) => {
  return (
    <ProfileSection title="Subscription">
      <ProfileField
        icon="crown"
        label="Plan"
        value={profileData?.subscriptionPlan || 'Free'}
        editable={false}
      />
      <ProfileField
        icon="calendar-check"
        label="Expires"
        value={formatDate(profileData?.subscriptionExpiry) || 'N/A'}
        editable={false}
      />
    </ProfileSection>
  );
};

export default SubscriptionSection;