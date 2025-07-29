
export const LoadingDisplay = () => {
  return (
    <div className="p-6">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <p className="text-center text-muted-foreground mt-2">
        מחשב השוואת מחירים...
      </p>
    </div>
  );
};
