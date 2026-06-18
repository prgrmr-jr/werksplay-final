import React from 'react';
import {Link} from 'react-router-dom';
import PageTitle from "../components/common/PageTitle.jsx";

const Tools = () => {
    const tools = [
        {
            id: 'chess-clock',
            name: 'Chess Clock',
            description: 'Chess timer used to track each player\'s time during a match.',
            path: '/tools/chess-clock',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
            borderColor: 'border-green-500/30',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                    <path d="M8 2 L8 4"/>
                    <path d="M16 2 L16 4"/>
                    <path d="M4 8 L6 8"/>
                    <path d="M18 8 L20 8"/>
                    <path d="M6 20 L8 18"/>
                    <path d="M16 18 L18 20"/>
                    <path d="M2 12 L4 12"/>
                    <path d="M20 12 L22 12"/>
                </svg>
            )
        }
        // {
        //   id: 'tool-2',
        //   name: 'Tool Name',
        //   description: 'Tool description',
        //   path: '/tools/tool-2',
        //   color: 'from-blue-500 to-purple-500',
        //   bgColor: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
        //   borderColor: 'border-blue-500/30',
        //   icon: (
        //     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        //       {/* Your SVG icon here */}
        //     </svg>
        //   )
        // }
    ];

    return (
        <>
            <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: #0a0a0a;
          color: white;
          font-family: Arial, sans-serif;
          min-height: 100vh;
        }
        .tools-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .tools-header {
          margin-bottom: 60px;
        }
        .tools-header h1 {
          font-family: 'Arial', sans-serif;
          font-weight: 700;
          font-size: 32px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .tools-header p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          margin-top: 4px;
        }
        .tools-header .error {
          color: #f87171;
          font-size: 14px;
          margin-top: 8px;
        }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .tool-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 32px 28px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.05), rgba(66, 165, 245, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .tool-card:hover::before {
          opacity: 1;
        }
        .tool-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .tool-card .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
          color: #00e676;
        }
        .tool-card .icon-wrapper svg {
          width: 32px;
          height: 32px;
          stroke: currentColor;
        }
        .tool-card .icon-wrapper .icon-bg {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          opacity: 0.15;
          transition: opacity 0.3s ease;
        }
        .tool-card:hover .icon-wrapper .icon-bg {
          opacity: 0.25;
        }
        .tool-card .icon-wrapper .icon-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .tool-card h2 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .tool-card p {
          color: #999;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 20px;
          flex: 1;
          position: relative;
          z-index: 1;
        }
        .tool-card .card-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .tool-card .card-footer .arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          font-size: 18px;
        }
        .tool-card:hover .card-footer .arrow {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }
        .tool-card .card-footer .tag {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .tool-card .card-footer .tag-available {
          background: #00e676;
          color: black;
        }
        .tool-card .card-footer .tag-coming {
          background: rgba(255, 255, 255, 0.1);
          color: #666;
        }
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .tools-container {
            padding: 20px 16px;
          }
          .tools-header {
            margin-bottom: 40px;
          }
          .tools-header h1 {
            font-size: 24px;
          }
          .tools-header p {
            font-size: 13px;
          }
          .tools-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .tool-card {
            padding: 24px 20px;
          }
          .tool-card .icon-wrapper {
            width: 56px;
            height: 56px;
          }
          .tool-card .icon-wrapper svg {
            width: 28px;
            height: 28px;
          }
          .tool-card h2 {
            font-size: 20px;
          }
          .tool-card p {
            font-size: 14px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .tools-container {
            padding: 16px 12px;
          }
          .tools-header h1 {
            font-size: 20px;
          }
          .tool-card {
            padding: 20px 16px;
          }
          .tool-card .icon-wrapper {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
          }
          .tool-card .icon-wrapper svg {
            width: 24px;
            height: 24px;
          }
          .tool-card h2 {
            font-size: 18px;
          }
          .tool-card p {
            font-size: 13px;
          }
        }
      `}</style>
            <div className="tools-container">
                <PageTitle
                    title="GAME TOOLS"
                    sub="Tools to enhance your game experience."
                />
                <div className="tools-grid">
                    {tools.map((tool) => (
                        <Link key={tool.id} to={tool.path} className="tool-card">
                            <div className="icon-wrapper">
                                <div className={`icon-bg ${tool.bgColor}`}/>
                                <span className="icon-content">{tool.icon}</span>
                            </div>
                            <h2>{tool.name}</h2>
                            <p>{tool.description}</p>
                            <div className="card-footer">
                                <span className="arrow">→</span>
                                <span className="tag tag-available">Available</span>
                            </div>
                        </Link>
                    ))}

                    {/* Coming Soon Cards */}
                    <div className="tool-card" style={{opacity: 0.5, cursor: 'default'}}>
                        <div className="icon-wrapper">
                            <div className="icon-bg bg-gradient-to-br from-gray-500/20 to-gray-700/20"/>
                            <span className="icon-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
                        </div>
                        <h2>More Coming Soon</h2>
                        <p>Stay tuned for updates!</p>
                        <div className="card-footer">
                            <span className="tag tag-coming">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tools;