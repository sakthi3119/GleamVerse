import React from 'react';

export default function Settings(){
  return (
    <div className="gv-container">
      <div className="auth">
        <h2>Settings</h2>
        <div className="row"><label>Theme</label><select className="select"><option>Default</option></select></div>
        <div className="row"><label>Notifications</label><select className="select"><option>Enabled</option><option>Disabled</option></select></div>
      </div>
    </div>
  );
}

