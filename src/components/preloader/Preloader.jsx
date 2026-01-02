import React from 'react';

const Preloader = () => {
  return (
    <div className="fixed inset-0 bg-[#DA2F49] flex items-center justify-center z-50">
      <img
        src="/preloader.gif"
        alt="Loading..."
        className="w-24 h-24 rounded-[30px]"
      />
    </div>
  );
};

export default Preloader;
