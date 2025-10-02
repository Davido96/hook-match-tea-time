interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  // Admin portal is now publicly accessible for testing
  return <>{children}</>;
};

export default AdminRoute;