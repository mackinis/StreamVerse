
import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string; 
  name: string;
  lastName: string; // Kept for consistency with registration
  surname?: string; // Added because user's provided admin code uses `surname`
  dni: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  avatar?: string;
  groups?: string[];
  isAdmin: boolean;
  isVerified: boolean;
  isSuspended?: boolean;
  createdAt?: string; 
}

export interface UserProfile { // Used by user's admin page code
  id: string;
  name: string;
  surname?: string; // Added
  email?: string; 
  avatar?: string; 
  role?: 'admin' | 'user'; // Added
}
export type SessionUserProfile = User & { role?: 'admin' | 'user' }; // For AuthContext if needed


export interface Course {
  id: string;
  title: string;
  description: string;
  courseVideoUrl: string;
  price: string;
  duration: string;
  date: string; 
  imageUrl?: string;
  videoPreviewUrl?: string;
  dataAiHint?: string;
  createdAt?: string; 
}

export interface UserStory {
  id: string; 
  userId: string;
  userName: string;
  userAvatar?: string;
  videoPreviewUrl?: string;
  title: string;
  storyText: string; 
  approved: boolean;
  createdAt?: string; 
  updatedAt?: string; 
  dataAiHint?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: number; 
}

export interface IncomingCall {
  adminSocketId: string;
  adminName: string;
}

export interface FooterLink {
  text: TranslationKey | string; 
  href: string;
}

export interface ChatModerationConfig {
  profanityFilterEnabled: boolean;
  bannedKeywords: string; 
  bannedUserIds: string;  
}

export interface GeneralSettingsConfig {
  language: 'en' | 'es';
  allowUserLanguageChange: boolean;
}

export interface Popup {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  contentUrl: string;
  displayCondition: 'once-per-session' | 'always';
  isActive: boolean;
  createdAt?: string;
}

export interface WhatsAppConfig {
  whatsAppEnabled: boolean;
  whatsAppPhoneNumber: string;
  whatsAppDefaultMessage: string;
  whatsAppIcon: string;
  whatsAppCustomIconUrl: string;
  whatsAppButtonSize: number;
  whatsAppIconSize: number;
  whatsAppButtonColor: string;
}

export type TranslationKey = 
  | 'navHome' | 'navCourses' | 'navStories' | 'navLive' | 'navCall' | 'navAdmin' | 'navLogout' | 'navLogin'
  | 'navLanguage' | 'navLanguageEN' | 'navLanguageES'
  | 'navAdminPanel' | 'navUserProfileDropdownProfile'
  | 'featuredCourses' | 'successStories' | 'viewAllCourses' | 'submitYourStory'
  | 'footerSlogan' | 'footerQuickLinks' | 'footerQuickLinksAboutUs' | 'footerQuickLinksPrivacyPolicy' | 'footerQuickLinksTerms'
  | 'footerDownloadApp' | 'footerGetOnGooglePlay' | 'footerDownloadOnAppStore' | 'footerFollowUs' | 'footerCopyright'
  | 'adminGeneralSettingsTitle' | 'adminLanguageSettingsCardTitle' | 'adminLanguageSettingsCardDescription'
  | 'adminPreferredLanguageLabel' | 'adminSaveLanguageButton'
  | 'adminAllowUserLangChangeLabel' | 'adminAllowUserLangChangeDescription' | 'adminSelectLanguagePlaceholder'
  | 'heroExploreCourses' | 'heroGoLive'
  | 'signInTitle' | 'signInDescription' | 'emailLabel' | 'passwordLabel' | 'signInButton'
  | 'forgotPasswordLink' | 'signUpPrompt' | 'signUpLink'
  | 'signUpTitle' | 'signUpDescription' | 'nameLabel' | 'lastNameLabel' | 'dniLabel' | 'phoneLabel' 
  | 'addressLabel' | 'postalCodeLabel' | 'cityLabel' | 'countryLabel' | 'confirmPasswordLabel' | 'signUpButton'
  | 'demoCredentialsTitle' | 'demoAdminCredentials' | 'demoUserCredentials'
  | 'loginSuccessToastTitle' | 'loginSuccessToastDescription' | 'loginFailedToastTitle' | 'loginFailedToastDescription'
  | 'signupPasswordsMismatchToastTitle' | 'signupPasswordsMismatchToastDescription'
  | 'signupSuccessToastTitle' | 'signupVerificationEmailSent'
  | 'coursesPageTitle' | 'coursesPageDescription' | 'searchCoursesPlaceholder' | 'noCoursesFound' | 'noCoursesAvailable'
  | 'userStoriesPageTitle' | 'userStoriesPageDescription' | 'noUserStoriesFound' | 'shareYourStoryButton'
  | 'submitStoryTitle' | 'submitStoryDescription' | 'storyTitleLabel' | 'storyTitlePlaceholder'
  | 'videoUrlLabel' | 'videoUrlPlaceholderOptional' | 'videoUrlHint'
  | 'yourStoryLabel' | 'yourStoryPlaceholder' | 'submitStoryButton' | 'submitStoryFooter'
  | 'authErrorToastTitle' | 'authErrorToastDescriptionLoggedIn'
  | 'storySubmittedToastTitle' | 'storySubmittedToastDescription' | 'storySubmissionFailed'
  | 'loadingAdminArea' | 'accessDeniedRedirecting'
  | 'adminDashboardTitle'
  | 'adminTotalUsers' | 'adminActiveStreams' | 'adminPendingStories' | 'adminChatMessages24h' | 'adminChatMessagesTotal'
  | 'adminPlatformUsageOverviewTitle' | 'adminPlatformUsageOverviewDescription' | 'adminAnalyticsPlaceholderTitle' | 'adminAnalyticsPlaceholderDescription'
  | 'adminRecentActivityTitle' | 'adminRecentActivityPlaceholder' | 'adminQuickActionsTitle'
  | 'adminManageCoursesButton' | 'adminReviewUserSubmissionsButton' | 'adminSendAnnouncementButton'
  | 'adminLiveConfigTitle' | 'adminStreamSourceAccessTitle' | 'adminStreamSourceAccessDescription'
  | 'adminStreamUrlLabel' | 'adminStreamUrlPlaceholder' | 'adminStreamUrlHint'
  | 'adminStreamAccessControlLabel' | 'adminSelectAccessTypePlaceholder'
  | 'adminAccessPublic' | 'adminAccessLoggedIn' | 'adminAccessGroup'
  | 'adminRequiredGroupLabel' | 'adminRequiredGroupPlaceholderStream'
  | 'adminNavLiveButtonTitle' | 'adminNavLiveButtonDescription'
  | 'adminShowLiveButtonLabel' | 'adminLiveButtonAccessLabel'
  | 'adminRequiredGroupPlaceholderButton' | 'adminSaveAllStreamSettingsButton'
  | 'adminChatConfigTitle' | 'adminChatAccessControlTitle' | 'adminChatAccessControlDescription'
  | 'adminChatAccessTypeLabel' | 'adminChatAccessPublic' | 'adminChatAccessPrivate' | 'adminChatAccessExclusive'
  | 'adminChatAccessPrivateNote' | 'adminRequiredGroupPlaceholderChat'
  | 'adminChatModerationTitle' | 'adminChatModerationDescription'
  | 'adminEnableProfanityFilterLabel' | 'adminBannedKeywordsLabel' | 'adminBannedKeywordsPlaceholder'
  | 'adminBannedKeywordsHint' | 'adminBannedUserIdsLabel' | 'adminBannedUserIdsPlaceholder'
  | 'adminBannedUserIdsHint' | 'adminSavedChatHistoryReviewLabel' | 'adminSavedChatHistoryReviewHint'
  | 'adminSaveChatSettingsButton'
  | 'adminHeroConfigTitle' | 'adminHeroCustomizeTitle' | 'adminHeroCustomizeDescription'
  | 'adminHeroMainHeadlineLabel' | 'adminHeroMainHeadlinePlaceholder'
  | 'adminHeroSecondaryHeadlineLabel' | 'adminHeroSecondaryHeadlinePlaceholder'
  | 'adminHeroDescriptionTextLabel' | 'adminHeroDescriptionTextPlaceholder'
  | 'adminHeroSaveChangesButton' | 'adminHeroLivePreviewTitle' | 'adminHeroLivePreviewDescription'
  | 'adminHeroLivePreviewMainTextDefault' | 'adminHeroLivePreviewSecondaryTextDefault' | 'adminHeroLivePreviewDescriptionTextDefault'
  | 'adminFooterConfigTitle' | 'adminFooterCustomizeTitle' | 'adminFooterCustomizeDescription'
  | 'adminFooterLogoTextLabel' | 'adminFooterLogoTextPlaceholder'
  | 'adminFooterLinksLegend' | 'adminFooterLinkTextLabel' | 'adminFooterLinkTextPlaceholder'
  | 'adminFooterLinkUrlLabel' | 'adminFooterLinkUrlPlaceholder'
  | 'adminFooterAddLinkButton' | 'adminFooterAndroidLinkLabel' | 'adminFooterAndroidLinkPlaceholder'
  | 'adminFooterIosLinkLabel' | 'adminFooterIosLinkPlaceholder'
  | 'adminFooterLogoUrlLabel' | 'adminFooterLogoUrlPlaceholder' | 'adminFooterLogoSizeLabel'
  | 'adminFooterLogoWidthPlaceholder' | 'adminFooterLogoHeightPlaceholder' | 'adminFooterLogoAlignmentLabel'
  | 'adminFooterLogoAlignmentHorizontalLabel' | 'adminFooterLogoAlignmentVerticalLabel'
  | 'adminFooterLogoAlignmentLeft' | 'adminFooterLogoAlignmentCenter' | 'adminFooterLogoAlignmentRight'
  | 'adminFooterLogoAlignmentTop' | 'adminFooterLogoAlignmentMiddle' | 'adminFooterLogoAlignmentBottom'
  | 'adminUserStoriesTitle' | 'adminUserStoriesSubmittedTitle' | 'adminUserStoriesSubmittedDescription'
  | 'adminUserStoriesPreviewHeader' | 'adminUserStoriesTitleHeader' | 'adminUserStoriesUserHeader'
  | 'adminUserStoriesStatusHeader' | 'adminUserStoriesActionsHeader' | 'adminUserStoriesNoPreview'
  | 'adminUserStoriesStatusApproved' | 'adminUserStoriesStatusPending' | 'adminUserStoriesToggleApprovalLabel'
  | 'adminUserStoriesNoStories' | 'adminUserStoriesToastApproved' | 'adminUserStoriesToastUnapproved' | 'adminUserStoriesUpdateError'
  | 'adminManageUsersTitle' | 'adminManageUsersListTitle' | 'adminManageUsersListDescription'
  | 'adminManageUsersSearchPlaceholder' | 'adminManageUsersAvatarHeader' | 'adminManageUsersNameHeader'
  | 'adminManageUsersEmailHeader' | 'adminManageUsersRoleHeader' | 'adminManageUsersGroupsHeader'
  | 'adminManageUsersActionsHeader' | 'adminManageUsersRoleAdmin' | 'adminManageUsersRoleUser'
  | 'adminManageUsersGroupsNone' | 'adminManageUsersStartVideoCallTitle' | 'adminManageUsersDesignateForCall'
  | 'adminManageUsersStartVideoCallAlertTitle' | 'adminManageUsersStartVideoCallAlertDescription'
  | 'adminManageUsersStartVideoCallAlertCancel' | 'adminManageUsersStartVideoCallAlertAction'
  | 'adminManageUsersVideoCallToastTitle' | 'adminManageUsersVideoCallToastDescription'
  | 'adminManageUsersRemoveAdminTitle' | 'adminManageUsersMakeAdminTitle'
  | 'adminManageUsersEditUserTitle' | 'adminManageUsersDeleteUserTitle' | 'adminManageUsersNoUsers'
  | 'adminManageUsersToastRoleUpdated' | 'adminManageUsersToastNowAdmin' | 'adminManageUsersToastNoLongerAdmin'
  | 'adminManageUsersUserDesignatedForCall' | 'adminManageUsersNavToCallPage'
  | 'adminVideoCallTitle' | 'adminVideoCallPeerToPeerTitle' | 'adminVideoCallPeerToPeerDescription'
  | 'adminVideoCallYourVideoLabel' | 'adminVideoCallUserVideoLabel' | 'adminVideoCallUserVideoWaitingLabel'
  | 'adminVideoCallCallingUserLabel' | 'adminVideoCallMicMute' | 'adminVideoCallMicUnmute'
  | 'adminVideoCallCameraOff' | 'adminVideoCallCameraOn' | 'adminVideoCallStartCallButton' | 'adminVideoCallStartCallButtonActive'
  | 'adminVideoCallEndCallButton' | 'adminVideoCallCallEndedStatus' | 'adminVideoCallTechnicalNoteTitle'
  | 'adminVideoCallTechnicalNoteP1' | 'adminVideoCallTechnicalNoteLi1' | 'adminVideoCallTechnicalNoteLi2'
  | 'adminVideoCallTechnicalNoteLi3' | 'adminVideoCallTechnicalNoteLi4' | 'adminVideoCallTechnicalNoteLi5'
  | 'adminVideoCallStatusConnectingTo' | 'adminVideoCallStatusConnectedTo' | 'adminVideoCallStatusCallEnded'
  | 'adminVideoCallStatusFailed' | 'adminVideoCallStatusCameraError' | 'adminVideoCallStatusUserNotConnected'
  | 'adminVideoCallStatusUserDisconnected' | 'adminVideoCallStatusCallTerminated' | 'adminVideoCallToastError'
  | 'adminVideoCallToastRemoteStream' | 'adminVideoCallToastLocalStream' | 'adminVideoCallToastNoRemoteStream'
  | 'adminVideoCallNoTargetUser' | 'adminVideoCallStatusNotAuthorized'
  | 'livePageStreamPlayerNotConfigured' | 'livePageStreamChatTitle' | 'livePageChatInputPlaceholder' 
  | 'livePageChatNoMessages' | 'livePageChatSendButtonLabel'
  | 'livePageLoginToSendMessage' | 'livePageMessageBlockedBanned' | 'livePageMessageBlockedLanguage'
  | 'livePageStreamTitleCardDefault' | 'livePageStreamDescriptionCardDefault' | 'livePageStreamNotConfiguredTitle'
  | 'livePageChatUnavailableTitle' | 'livePageChatUnavailableDescription' | 'livePageChatRequiresLogin' | 'livePageChatAccessGroupDenied'
  | 'livePageAccessDeniedTitle' | 'livePageAccessDeniedDescription' 
  | 'livePageAccessDeniedPrivateCallTitle' | 'livePageAccessDeniedPrivateCallDesc'
  | 'livePageStreamAccessDeniedUser' | 'livePageStreamRequiresLogin' | 'livePageStreamAccessGroupDenied'
  | 'livePageStreamVideoNotSupported'
  | 'livePageGoToHomepageButton'
  | 'livePageLoading' | 'loginRequiredForLiveStream'
  | 'loginRequiredSubmitStory' | 'accessDenied' | 'pleaseLoginSubmit'
  | 'toastSettingsSaved'
  | 'verifyAccountTitle' | 'verifyAccountDescription' | 'verificationTokenLabel' | 'verifyButton'
  | 'resendTokenButton' | 'verificationSuccessToastTitle' | 'verificationSuccessToastDescription'
  | 'verificationFailedToastTitle' | 'verificationFailedToastDescription'
  | 'tokenResentToastTitle' | 'tokenResentToastDescription' | 'errorUserNotFound' | 'errorTokenInvalid'
  | 'errorEmailAlreadyExists' | 'errorRegistrationFailed' | 'errorLoginFailed' | 'errorVerificationFailed'
  | 'errorResendTokenFailed'
  | 'userVideoCallIncomingCallTitle' | 'userVideoCallIncomingCallFrom' | 'userVideoCallAcceptButton'
  | 'userVideoCallRejectButton' | 'userVideoCallStatusConnecting' | 'userVideoCallStatusConnected'
  | 'userVideoCallStatusCallEnded' | 'userVideoCallStatusFailed' | 'userVideoCallStatusAdminEnded'
  | 'userVideoCallStatusCameraError' | 'userVideoCallToastError' | 'userVideoCallStatusCallNotAuthorized'
  | 'userVideoCallWaitingTitle' | 'userVideoCallWaitingDescription'
  | 'noActiveCallTitle' | 'noActiveCallDesc'
  | 'adminLivestream.pageTitle'
  | 'adminLivestream.configCard.title' | 'adminLivestream.configCard.description'
  | 'adminLivestream.configCard.currentLiveTitleLabel' | 'adminLivestream.configCard.titlePlaceholder'
  | 'adminLivestream.configCard.currentLiveTitleHelpText' | 'adminLivestream.configCard.currentLiveSubtitleLabel'
  | 'adminLivestream.configCard.subtitlePlaceholder' | 'adminLivestream.configCard.currentLiveSubtitleHelpText'
  | 'adminLivestream.configCard.statusLabel' | 'adminLivestream.configCard.statusLive' | 'adminLivestream.configCard.statusOffline'
  | 'adminLivestream.configCard.offlineMessageLabel' | 'adminLivestream.configCard.offlineMessagePlaceholder'
  | 'adminLivestream.configCard.offlineMessageHelpText' | 'adminLivestream.configCard.saveSettingsButton'
  | 'adminLivestream.streamControlCard.startStreamButton' | 'adminLivestream.streamControlCard.stopStreamButton'
  | 'adminLivestream.streamControlCard.muteMicButton' | 'adminLivestream.streamControlCard.unmuteMicButton'
  | 'adminLivestream.streamControlCard.muteLocalAudioButton' | 'adminLivestream.streamControlCard.unmuteLocalAudioButton'
  | 'adminLivestream.statsCard.viewersLabel'
  | 'adminLivestream.videoArea.title' | 'adminLivestream.videoArea.offlineMessage' | 'adminLivestream.videoArea.startingCamera'
  | 'adminLivestream.userLocalVideoLabel' | 'adminLivestream.remoteUserVideoLabel'
  | 'adminLivestream.privateCall.cardTitle' | 'adminLivestream.privateCall.configCard.authorizedUserLabel'
  | 'adminLivestream.startPrivateCallButton' | 'adminLivestream.endPrivateCallButton'
  | 'adminLivestream.privateCall.statusConnecting' | 'adminLivestream.privateCall.statusConnected'
  | 'adminLivestream.privateCall.statusFailed' | 'adminLivestream.privateCall.statusEnded'
  | 'adminLivestream.privateCall.statusUserConnected' | 'adminLivestream.privateCall.statusUserDisconnected'
  | 'adminLivestream.privateCall.noUserConfigured' | 'adminLivestream.privateCall.cannotStartTitle'
  | 'adminLivestream.privateCall.noUserConnected' | 'adminLivestream.privateCall.callEndedTitle'
  | 'adminLivestream.privateCall.statusCameraError'
  | 'adminLivestream.toast.socketConnectedTitle' | 'adminLivestream.toast.socketConnectedDescription'
  | 'adminLivestream.toast.socketDisconnectedTitle' | 'adminLivestream.toast.socketDisconnectedStreamInterrupt'
  | 'adminLivestream.toast.errorTitle' | 'adminLivestream.toast.genericError' | 'adminLivestream.toast.socketNotConnectedError'
  | 'adminLivestream.toast.streamErrorTitle'
  | 'adminLivestream.toast.cameraAccessDeniedTitle' | 'adminLivestream.toast.cameraAccessDeniedDescription'
  | 'adminLivestream.toast.unsupportedBrowserTitle' | 'adminLivestream.toast.unsupportedBrowserDescription'
  | 'adminLivestream.toast.streamStartingTitle' | 'adminLivestream.toast.streamStoppedTitle' | 'adminLivestream.toast.streamStoppedDescription'
  | 'adminLivestream.toast.publicStreamInfo' | 'adminLivestream.toast.loggedInOnlyStreamInfo'
  | 'adminLivestream.toast.microphoneStatusTitle' | 'adminLivestream.toast.microphoneMuted' | 'adminLivestream.toast.microphoneUnmuted'
  | 'adminLivestream.toast.localAudioStatusTitle' | 'adminLivestream.toast.localAudioMuted' | 'adminLivestream.toast.localAudioUnmuted'
  | 'adminLivestream.toast.settingsSavedTitle' | 'adminLivestream.toast.persistentSettingsSavedDescription'
  | 'adminLivestream.toast.callUserDisconnected' | 'adminLivestream.toast.loggedInOnlyClearsSpecificUser'
  | 'adminLivestream.liveStreamForLoggedInUsersOnly' | 'adminLivestream.liveStreamForLoggedInUsersOnlyDescription'
  | 'adminLivestream.defaultStreamTitle' | 'adminLivestream.defaultOfflineMessage'
  | 'adminLivestream.persistentSettings.title' | 'adminLivestream.persistentSettings.fallbackSubtitle'
  ;

export interface Translations {
  [key: string]: { 
    [key in TranslationKey]?: string;
  };
}

export interface AdminConfig {
  streamSource: 'url' | 'webcam';
  liveStreamUrl: string;
  liveStreamAccess: 'public' | 'loggedIn' | 'group';
  liveStreamAccessGroup: string;
  liveButtonVisible: boolean;
  liveButtonAccess: 'public' | 'loggedIn' | 'group';
  liveButtonAccessGroup: string;
  chatAccess: 'public' | 'private' | 'exclusive' | 'loggedIn'; 
  chatAccessGroup: string;
  heroConfig: {
    mainText: string;
    secondaryText: string;
    descriptionText: string;
    heroImageUrl?: string;
    mainTextColor?: string;
  };
  footerConfig: {
    logoUrl: string;
    logoWidth: number;
    logoHeight: number;
    logoAlignmentHorizontal: 'left' | 'center' | 'right';
    logoAlignmentVertical: 'top' | 'center' | 'bottom';
    slogan: string;
    links: FooterLink[];
    androidAppLink: string;
    iosAppLink: string;
    showAndroidApp: boolean;
    androidAppIconUrl: string;
    showIosApp: boolean;
    iosAppIconUrl: string;
    mobileAppsSectionTitle: string;
  };
  chatModeration: ChatModerationConfig;
  chatMessages: ChatMessage[]; 
  generalSettings: GeneralSettingsConfig;
  liveStreamAuthorizedUserId: string | null; 
  whatsAppConfig: WhatsAppConfig;
  liveStreamDefaultTitle?: string;
  persistentSubtitle?: string;
  liveStreamOfflineMessage?: string;
  liveStreamForLoggedInUsersOnly?: boolean;
}

// SiteSettings is what socket_io.ts primarily uses from Firestore
export interface SiteSettings {
  adminAppUserId: string; // Crucial for socket_io.ts logic
  liveStreamAuthorizedUserId?: string | null;
  liveStreamDefaultTitle?: string;
  liveStreamForLoggedInUsersOnly?: boolean;
  liveStreamOfflineMessage?: string;
  persistentSubtitle?: string;
}

export interface UserDocument {
  id?: string; 
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  hashedPassword?: string; 
  salt?: string; 
  avatar?: string;
  groups?: string[];
  isAdmin: boolean;
  verificationToken?: string | null; 
  isVerified: boolean;
  isSuspended?: boolean;
  tokenExpiresAt?: number | null; 
  createdAt?: Timestamp; 
}

export interface UserStoryDocument {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  videoPreviewUrl: string;
  title: string;
  storyText: string;
  approved: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  dataAiHint?: string;
}

export interface CourseDocument {
  id?: string;
  title: string;
  description: string;
  courseVideoUrl: string;
  price: string;
  duration: string;
  date: string; 
  imageUrl?: string;
  videoPreviewUrl?: string;
  dataAiHint?: string;
  createdAt?: Timestamp;
}

export interface PopupDocument {
  id?: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  contentUrl: string;
  displayCondition: 'once-per-session' | 'always';
  isActive: boolean;
  createdAt?: Timestamp;
}
