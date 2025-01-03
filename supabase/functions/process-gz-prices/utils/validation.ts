export const validateRequest = (formData: FormData) => {
  const file = formData.get('file');
  const networkName = formData.get('networkName');
  const branchName = formData.get('branchName');
  const storeAddress = formData.get('storeAddress');

  if (!file || !networkName || !branchName || !storeAddress) {
    console.error('Missing required fields:', { 
      hasFile: !!file, 
      hasNetworkName: !!networkName, 
      hasBranchName: !!branchName,
      hasStoreAddress: !!storeAddress 
    });
    
    throw new Error('חסרים שדות נדרשים: קובץ, שם רשת, שם סניף או כתובת');
  }

  return { file, networkName, branchName, storeAddress };
};