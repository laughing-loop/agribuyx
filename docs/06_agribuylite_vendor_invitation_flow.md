# AgriBuy Lite – Vendor Invitation Flow

This document outlines the process for inviting and onboarding vendors in AgriBuy Lite. In this phase, vendor registration is not public; it is strictly controlled by administrators to ensure a curated and trusted marketplace.

---

## 6.1 Overview

The vendor invitation flow is designed to be simple and secure. Only administrators can initiate the process, preventing unauthorized vendor sign-ups. This approach allows the AgriBuy Lite team to vet and approve vendors before they can list products on the platform.

---

## 6.2 The Flow

The process can be broken down into the following steps:

1.  **Vendor Expresses Interest:** A potential vendor contacts the AgriBuy Lite team through offline channels (e.g., email, phone call, in-person).

2.  **Administrator Vetting:** An administrator reviews the vendor's information and decides whether to approve them for an invitation.

3.  **Invitation Generation:** The administrator generates a unique, single-use invitation link or code from the admin dashboard. This is recorded in the `vendor_invites` table in the database.

4.  **Invitation Sent:** The administrator sends the invitation link to the vendor via email or another secure method.

5.  **Vendor Registration:** The vendor clicks the unique link, which takes them to a private registration page. They fill out their details (name, email, password, phone number). The system verifies that the invitation code is valid and has not been used.

6.  **Account Creation:** Upon successful registration, a new entry is created in the `vendors` table, and the `vendor_invites` record is marked as used.

7.  **Vendor Access:** The vendor can now log in to their dashboard to manage their profile and, once enabled, their products.

---

## 6.3 Database Tables Involved

*   `vendor_invites`: Stores the unique invitation token, the invited email, and a boolean `is_used` flag.
*   `vendors`: Stores the vendor's account information. The `invite_id` field links back to the `vendor_invites` table.
*   `admins`: Administrators who have the authority to generate invites.

---

## 6.4 Security Considerations

*   **Unique, Single-Use Tokens:** Each invitation link can only be used once.
*   **Role-Based Access Control (RBAC):** Only users with the 'admin' role can generate invitation links.
*   **Time-Limited Invitations (Future):** In a future iteration, invitation links could be set to expire after a certain period to enhance security.

---

## 6.5 Summary

The invite-only system provides a controlled environment for the initial phase of AgriBuy Lite, ensuring that only approved vendors can join the platform. This manual but secure process is a foundational step before opening up to public vendor registration in AgriBuy Core.
