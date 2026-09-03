import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ActivityPage } from '../pages/ActivityPage';
import { CatalogPage } from '../pages/CatalogPage';
import { GiftDetailsPage } from '../pages/GiftDetailsPage';
import { HomePage } from '../pages/HomePage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TopUpPage } from '../pages/TopUpPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="gifts" element={<CatalogPage />} />
        <Route path="gifts/:giftId" element={<GiftDetailsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="top-up" element={<TopUpPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
