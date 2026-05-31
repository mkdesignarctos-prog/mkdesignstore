/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Home } from './pages/Home';
import { AppDetails } from './pages/AppDetails';
import { Publish } from './pages/Publish';
import { DeveloperProfile } from './pages/DeveloperProfile';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/:id" element={<AppDetails />} />
          <Route path="/developer/:id" element={<DeveloperProfile />} />
          <Route path="/publish" element={<Publish />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
