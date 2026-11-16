import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:3079/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // USER MANAGEMENT
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // BAN DIALOG
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // REPORT MANAGEMENT
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const [reportStatus, setReportStatus] = useState("pending");
  const [reportPage, setReportPage] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [resolutionNote, setResolutionNote] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // FETCH OVERVIEW
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/overview`,
          authConfig,
        );

        setOverview(response.data.overview);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load admin dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [token]);

  // FETCH USERS
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        ...authConfig,
        params: {
          search,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      setUsers(response.data.users || []);
      setTotalUsers(
        response.data.pagination?.totalUsers ??
          response.data.pagination?.total ??
          0,
      );
    } catch (err) {
      setUsersError(err.response?.data?.error || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [token, search, page, rowsPerPage]);

  useEffect(() => {
    if (activeTab !== 1) return;

    const timeout = setTimeout(() => {
      fetchUsers();
    }, 350);

    return () => clearTimeout(timeout);
  }, [activeTab, fetchUsers]);

  // FETCH REPORTS
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError("");

    try {
      const response = await axios.get(`${API_URL}/admin/reports`, {
        ...authConfig,
        params: {
          status: reportStatus,
          page: reportPage + 1,
          limit: 20,
        },
      });

      setReports(response.data.reports || []);
      setTotalReports(
        response.data.pagination?.totalReports ??
          response.data.pagination?.total ??
          0,
      );
    } catch (err) {
      setReportsError(err.response?.data?.error || "Failed to load reports.");
    } finally {
      setReportsLoading(false);
    }
  }, [token, reportStatus, reportPage]);

  useEffect(() => {
    if (activeTab !== 2) return;

    fetchReports();
  }, [activeTab, fetchReports]);

  // OPEN BAN DIALOG
  const openBanDialog = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setActionError("");
    setBanDialogOpen(true);
  };

  // BAN USER
  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      setActionError("Please provide a reason for the ban.");
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await axios.patch(
        `${API_URL}/admin/users/${selectedUser.id}/ban`,
        { reason: banReason.trim() },
        authConfig,
      );

      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");

      await fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to ban user.");
    } finally {
      setActionLoading(false);
    }
  };

  // UNBAN USER
  const handleUnbanUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to unban @${user.username}?`,
    );

    if (!confirmed) return;

    setActionLoading(true);
    setUsersError("");

    try {
      await axios.patch(
        `${API_URL}/admin/users/${user.id}/unban`,
        {},
        authConfig,
      );

      await fetchUsers();
    } catch (err) {
      setUsersError(err.response?.data?.error || "Failed to unban user.");
    } finally {
      setActionLoading(false);
    }
  };

  // OPEN REVIEW DIALOG
  const openReviewDialog = (report) => {
    setSelectedReport(report);
    setReviewStatus("reviewed");
    setResolutionNote("");
    setReviewError("");
    setReviewDialogOpen(true);
  };

  // REVIEW REPORT
  const handleReviewReport = async () => {
    if (!selectedReport) return;

    setReviewLoading(true);
    setReviewError("");

    try {
      await axios.patch(
        `${API_URL}/admin/reports/${selectedReport.id}/review`,
        {
          status: reviewStatus,
          resolutionNote: resolutionNote.trim(),
        },
        authConfig,
      );

      setReviewDialogOpen(false);
      setSelectedReport(null);

      await fetchReports();
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to review report.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Admin Dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Manage users, reports, and community moderation.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 4 }}
      >
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Reports" />
      </Tabs>

      {/* OVERVIEW */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Platform Overview
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {[
              {
                label: "Total Users",
                value: overview?.totalUsers ?? 0,
              },
              {
                label: "Total Posts",
                value: overview?.totalPosts ?? 0,
              },
              {
                label: "Total Comments",
                value: overview?.totalComments ?? 0,
              },
            ].map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {item.label}
                </Typography>

                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {item.value}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* USERS */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            User Management
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Search by username or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{ mb: 3, maxWidth: 500 }}
          />

          {usersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          )}

          {usersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">
                              @{user.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.firstName} {user.lastName}
                            </Typography>
                          </TableCell>

                          <TableCell>{user.email}</TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={user.role?.name || "user"}
                              color={
                                user.role?.name === "admin"
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={user.isBanned ? "Banned" : "Active"}
                              color={user.isBanned ? "error" : "success"}
                            />
                          </TableCell>

                          <TableCell>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </TableCell>

                          <TableCell align="right">
                            {user.role?.name === "admin" ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Admin account
                              </Typography>
                            ) : user.isBanned ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={actionLoading}
                                onClick={() => handleUnbanUser(user)}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoading}
                                onClick={() => openBanDialog(user)}
                              >
                                Ban
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Paper>
          )}
        </Box>
      )}

      {/* REPORTS */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Report Management
          </Typography>

          <TextField
            select
            size="small"
            label="Filter by status"
            value={reportStatus}
            onChange={(event) => {
              setReportStatus(event.target.value);
              setReportPage(0);
            }}
            sx={{ mb: 3, minWidth: 200 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="actioned">Actioned</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </TextField>

          {reportsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reportsError}
            </Alert>
          )}

          {reportsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reported User</TableCell>
                      <TableCell>Reported By</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            @{report.reportedUser?.username || "Unknown"}
                          </TableCell>

                          <TableCell>
                            @{report.reporter?.username || "Unknown"}
                          </TableCell>

                          <TableCell>
                            <Chip size="small" label={report.targetType} />
                            <Typography variant="caption" display="block">
                              ID: {report.targetId}
                            </Typography>
                          </TableCell>

                          <TableCell>{report.reason}</TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={report.status}
                              color={
                                report.status === "pending"
                                  ? "warning"
                                  : report.status === "actioned"
                                    ? "error"
                                    : report.status === "dismissed"
                                      ? "default"
                                      : "success"
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={
                                report.status === "pending"
                                  ? "outlined"
                                  : "text"
                              }
                              onClick={() => openReviewDialog(report)}
                            >
                              {report.status === "pending" ? "Review" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalReports}
                page={reportPage}
                onPageChange={(event, newPage) => setReportPage(newPage)}
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
              />
            </Paper>
          )}
        </Box>
      )}

      {/* BAN DIALOG */}
      <Dialog
        open={banDialogOpen}
        onClose={() => {
          if (!actionLoading) setBanDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ban User</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You are about to ban <strong>@{selectedUser?.username}</strong>.
            They will no longer be able to access their account.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason for ban"
            placeholder="Explain why this user is being banned..."
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            disabled={actionLoading}
          />

          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setBanDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleBanUser}
            disabled={actionLoading || !banReason.trim()}
          >
            {actionLoading ? "Banning..." : "Confirm Ban"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* REPORT REVIEW DIALOG */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => {
          if (!reviewLoading) setReviewDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Review Report #{selectedReport?.id}</DialogTitle>

        <DialogContent>
          {selectedReport && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Reported user
              </Typography>
              <Typography sx={{ mb: 2 }}>
                @{selectedReport.reportedUser?.username || "Unknown"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Reported by
              </Typography>
              <Typography sx={{ mb: 2 }}>
                @{selectedReport.reporter?.username || "Unknown"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Target
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {selectedReport.targetType} #{selectedReport.targetId}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Reason
              </Typography>
              <Typography sx={{ mb: 2 }}>{selectedReport.reason}</Typography>

              <Typography variant="body2" color="text.secondary">
                Additional details
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {selectedReport.details || "No additional details provided."}
              </Typography>

              {selectedReport.targetSnapshot && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Content snapshot
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      mb: 2,
                      maxHeight: 180,
                      overflow: "auto",
                    }}
                  >
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                      {JSON.stringify(selectedReport.targetSnapshot, null, 2)}
                    </pre>
                  </Paper>
                </>
              )}
            </Box>
          )}

          {selectedReport?.status === "pending" ? (
            <>
              <TextField
                select
                fullWidth
                label="Decision"
                value={reviewStatus}
                onChange={(event) => setReviewStatus(event.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="reviewed">Reviewed — no action yet</MenuItem>
                <MenuItem value="actioned">Actioned — action taken</MenuItem>
                <MenuItem value="dismissed">Dismissed — no violation</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Resolution note"
                placeholder="Explain your decision..."
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
              />
            </>
          ) : (
            <Alert severity="info">
              This report has already been processed.
              <Typography variant="body2" sx={{ mt: 1 }}>
                Status: {selectedReport?.status}
              </Typography>
              <Typography variant="body2">
                Resolution:{" "}
                {selectedReport?.resolutionNote || "No note provided."}
              </Typography>
            </Alert>
          )}

          {reviewError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {reviewError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setReviewDialogOpen(false)}
            disabled={reviewLoading}
          >
            Close
          </Button>

          {selectedReport?.status === "pending" && (
            <Button
              variant="contained"
              onClick={handleReviewReport}
              disabled={reviewLoading}
            >
              {reviewLoading ? "Saving..." : "Submit Decision"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
