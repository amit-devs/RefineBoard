import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Seed Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@refineboard.com' },
    update: { passwordHash },
    create: {
      name: 'Demo User',
      email: 'demo@refineboard.com',
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`[Seed] Demo user created: ${demoUser.email} / Password123!`);

  // 2. Seed Default Settings
  await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      workspaceName: 'E-Commerce Platform',
      defaultPriority: 'medium',
      defaultDevStatus: 'draft',
      defaultRefinementStage: 'draft',
      dorQualityThreshold: 70,
      activeSprint: 'sprint-4',
    },
  });
  console.log('[Seed] Default settings created.');

  // 3. Seed Sprints
  const sprints = [
    { id: 'sprint-1', name: 'Sprint 1', startDate: '2026-07-01', endDate: '2026-07-14', goal: 'Core authentication and user management', active: false },
    { id: 'sprint-2', name: 'Sprint 2', startDate: '2026-07-15', endDate: '2026-07-28', goal: 'Product catalog and search functionality', active: false },
    { id: 'sprint-3', name: 'Sprint 3', startDate: '2026-07-29', endDate: '2026-08-11', goal: 'Shopping cart and checkout flow', active: false },
    { id: 'sprint-4', name: 'Sprint 4', startDate: '2026-08-24', endDate: '2026-09-06', goal: 'Security, notifications, and admin features', active: true },
  ];

  for (const s of sprints) {
    await prisma.sprint.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }
  console.log('[Seed] Sprints seeded.');

  // 4. Seed Team Members
  const team = [
    { id: 'tm-1', name: 'Sarah Chen', role: 'Product Owner', avatar: 'SC', avatarColor: '#667A63' },
    { id: 'tm-2', name: 'Mike Torres', role: 'Tech Lead', avatar: 'MT', avatarColor: '#B86F5B' },
    { id: 'tm-3', name: 'Priya Sharma', role: 'Senior Dev', avatar: 'PS', avatarColor: '#C59A45' },
    { id: 'tm-4', name: 'Alex Kim', role: 'QA Engineer', avatar: 'AK', avatarColor: '#8A8A5C' },
    { id: 'tm-5', name: 'James Liu', role: 'Frontend Dev', avatar: 'JL', avatarColor: '#667A63' },
  ];

  for (const t of team) {
    await prisma.teamMember.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log('[Seed] Team members seeded.');

  // 5. Seed Stories
  const storiesData = [
    {
      id: 'US-001',
      title: 'User Registration',
      asA: 'new visitor',
      iWant: 'to create an account using my email address and password',
      soThat: 'I can access the platform and manage my profile and orders',
      priority: 'high',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 5,
      businessValue: 9,
      effort: 5,
      sprintId: 'sprint-1',
      assignee: 'Priya Sharma',
      tags: JSON.stringify(['Authentication', 'Frontend', 'Backend']),
      dependenciesReviewed: true,
      qualityScore: 90,
      position: 1,
      acceptanceCriteria: [
        { id: 'ac-001-1', given: 'the user is on the registration page', when: 'the user enters a valid email and password and clicks Register', then: 'the system should create a new account and send a verification email', completed: true, testability: 'good' },
        { id: 'ac-001-2', given: 'the user attempts to register with an already-registered email', when: 'the user submits the registration form', then: 'the system should display an error message stating the email is already in use', completed: true, testability: 'good' },
        { id: 'ac-001-3', given: 'the user submits the registration form with a weak password', when: 'the password does not meet the minimum requirements', then: 'the system should display a password strength error and prevent form submission', completed: true, testability: 'good' },
      ],
      dependencies: [],
      activityLog: [
        { field: 'status', description: 'Status changed to Done', oldValue: 'in-progress', newValue: 'done', author: 'Priya Sharma' },
        { field: 'storyPoints', description: 'Story points set to 5', oldValue: '3', newValue: '5', author: 'Mike Torres' },
      ],
    },
    {
      id: 'US-002',
      title: 'User Login',
      asA: 'registered user',
      iWant: 'to log in to my account using my email and password',
      soThat: 'I can access my personal dashboard and manage my account',
      priority: 'critical',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 3,
      businessValue: 10,
      effort: 3,
      sprintId: 'sprint-1',
      assignee: 'Priya Sharma',
      tags: JSON.stringify(['Authentication', 'Security', 'Frontend']),
      dependenciesReviewed: true,
      qualityScore: 95,
      position: 2,
      acceptanceCriteria: [
        { id: 'ac-002-1', given: 'the user is on the login page', when: 'the user enters valid credentials and submits the form', then: 'the system should authenticate the user and redirect to the dashboard', completed: true, testability: 'good' },
        { id: 'ac-002-2', given: 'the user enters invalid credentials', when: 'the user submits the login form', then: 'the system should display an error message and not reveal which field is incorrect', completed: true, testability: 'good' },
        { id: 'ac-002-3', given: 'the user fails login 5 consecutive times', when: 'the account lockout threshold is reached', then: 'the system should temporarily lock the account and send an alert email to the user', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-001', title: 'User Registration', type: 'depends-on' }],
      activityLog: [
        { field: 'status', description: 'Status changed to Done', oldValue: 'ready', newValue: 'done', author: 'Priya Sharma' },
      ],
    },
    {
      id: 'US-003',
      title: 'Password Reset',
      asA: 'registered user',
      iWant: 'to reset my password through email verification',
      soThat: 'I can regain access to my account without contacting support',
      priority: 'high',
      devStatus: 'draft',
      refinementStage: 'needs-refinement',
      storyPoints: 5,
      businessValue: 8,
      effort: 5,
      sprintId: 'sprint-4',
      assignee: 'Sarah Chen',
      tags: JSON.stringify(['Authentication', 'Security', 'Email']),
      dependenciesReviewed: true,
      qualityScore: 75,
      position: 3,
      acceptanceCriteria: [
        { id: 'ac-003-1', given: 'the user has a registered account', when: 'the user requests a password reset', then: 'a password reset link should be sent to the registered email address within 2 minutes', completed: false, testability: 'good' },
        { id: 'ac-003-2', given: 'the user clicks the password reset link', when: 'the link is valid and not expired', then: 'the system should display a form allowing the user to set a new password', completed: false, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-001', title: 'User Registration', type: 'depends-on' }],
      activityLog: [
        { field: 'priority', description: 'Priority changed to High', oldValue: 'medium', newValue: 'high', author: 'Mike Torres' },
      ],
    },
    {
      id: 'US-004',
      title: 'Email Verification',
      asA: 'new user',
      iWant: 'to verify my email address after registration',
      soThat: 'the platform can confirm my identity and prevent fraudulent accounts',
      priority: 'high',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 3,
      businessValue: 7,
      effort: 3,
      sprintId: 'sprint-1',
      assignee: 'James Liu',
      tags: JSON.stringify(['Authentication', 'Email', 'Security']),
      dependenciesReviewed: true,
      qualityScore: 85,
      position: 4,
      acceptanceCriteria: [
        { id: 'ac-004-1', given: 'the user has registered a new account', when: 'the user clicks the verification link in the email', then: 'the system should verify the account and redirect the user to the dashboard with a success message', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-001', title: 'User Registration', type: 'depends-on' }],
      activityLog: [],
    },
    {
      id: 'US-005',
      title: 'Profile Management',
      asA: 'authenticated user',
      iWant: 'to view and update my profile information including name, avatar, and preferences',
      soThat: 'I can personalize my account and keep my information current',
      priority: 'medium',
      devStatus: 'in-progress',
      refinementStage: 'ready',
      storyPoints: 5,
      businessValue: 6,
      effort: 5,
      sprintId: 'sprint-4',
      assignee: 'James Liu',
      tags: JSON.stringify(['Frontend', 'UI/UX']),
      dependenciesReviewed: true,
      qualityScore: 90,
      position: 5,
      acceptanceCriteria: [
        { id: 'ac-005-1', given: 'the user is logged in and navigates to their profile page', when: 'the user updates their display name and saves', then: 'the system should update the profile and display a success confirmation', completed: true, testability: 'good' },
        { id: 'ac-005-2', given: 'the user is on their profile page', when: 'the user uploads a new avatar image', then: 'the system should validate the file type and size, then update the avatar across the platform', completed: false, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-002', title: 'User Login', type: 'depends-on' }],
      activityLog: [
        { field: 'status', description: 'Status changed to In Progress', oldValue: 'ready', newValue: 'in-progress', author: 'James Liu' },
      ],
    },
    {
      id: 'US-006',
      title: 'Product Search',
      asA: 'shopper',
      iWant: 'to search for products using keywords',
      soThat: 'I can quickly find items I am looking for without browsing the full catalog',
      priority: 'high',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 8,
      businessValue: 9,
      effort: 8,
      sprintId: 'sprint-2',
      assignee: 'Priya Sharma',
      tags: JSON.stringify(['Frontend', 'Backend', 'API']),
      dependenciesReviewed: true,
      qualityScore: 95,
      position: 6,
      acceptanceCriteria: [
        { id: 'ac-006-1', given: 'the user is on any page of the platform', when: 'the user enters a search term and submits', then: 'the system should display relevant products matching the keyword within 300ms', completed: true, testability: 'good' },
        { id: 'ac-006-2', given: 'the user searches for a term with no matching products', when: 'the search returns no results', then: 'the system should display a helpful empty state with suggested categories', completed: true, testability: 'good' },
      ],
      dependencies: [],
      activityLog: [],
    },
    {
      id: 'US-007',
      title: 'Product Filtering',
      asA: 'shopper',
      iWant: 'to filter products by category, price range, rating, and availability',
      soThat: 'I can narrow down results and find exactly what I need',
      priority: 'medium',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 5,
      businessValue: 8,
      effort: 5,
      sprintId: 'sprint-2',
      assignee: 'James Liu',
      tags: JSON.stringify(['Frontend', 'UI/UX']),
      dependenciesReviewed: true,
      qualityScore: 85,
      position: 7,
      acceptanceCriteria: [
        { id: 'ac-007-1', given: 'the user is viewing a list of products', when: 'the user applies a price range filter', then: 'the system should display only products within the specified price range and update the count', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-006', title: 'Product Search', type: 'depends-on' }],
      activityLog: [],
    },
    {
      id: 'US-008',
      title: 'Shopping Cart',
      asA: 'shopper',
      iWant: 'to add products to a shopping cart and manage quantities',
      soThat: 'I can collect items before proceeding to checkout',
      priority: 'critical',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 8,
      businessValue: 10,
      effort: 8,
      sprintId: 'sprint-3',
      assignee: 'Priya Sharma',
      tags: JSON.stringify(['Frontend', 'Backend']),
      dependenciesReviewed: true,
      qualityScore: 95,
      position: 8,
      acceptanceCriteria: [
        { id: 'ac-008-1', given: 'the user is viewing a product', when: 'the user clicks Add to Cart', then: 'the system should add the product to the cart and update the cart icon count', completed: true, testability: 'good' },
        { id: 'ac-008-2', given: 'the user has items in the cart', when: 'the user changes the quantity', then: 'the system should update the subtotal in real-time and validate against available stock', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-006', title: 'Product Search', type: 'depends-on' }],
      activityLog: [],
    },
    {
      id: 'US-009',
      title: 'Checkout Process',
      asA: 'shopper',
      iWant: 'to complete my purchase through a guided multi-step checkout process',
      soThat: 'I can securely provide my shipping and payment details to complete my order',
      priority: 'critical',
      devStatus: 'done',
      refinementStage: 'ready',
      storyPoints: 13,
      businessValue: 10,
      effort: 13,
      sprintId: 'sprint-3',
      assignee: 'Mike Torres',
      tags: JSON.stringify(['Frontend', 'Backend', 'Payment']),
      dependenciesReviewed: true,
      qualityScore: 95,
      position: 9,
      acceptanceCriteria: [
        { id: 'ac-009-1', given: 'the user has items in their cart', when: 'the user proceeds to checkout', then: 'the system should display a multi-step form for shipping address, delivery method, and payment', completed: true, testability: 'good' },
        { id: 'ac-009-2', given: 'the user completes all checkout steps', when: 'the user places the order', then: 'the system should process the order and send a confirmation email with an order number', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-008', title: 'Shopping Cart', type: 'depends-on' }],
      activityLog: [],
    },
    {
      id: 'US-010',
      title: 'Payment Processing',
      asA: 'shopper',
      iWant: 'to pay for my order using credit card or digital wallet',
      soThat: 'I can complete my purchase securely and conveniently',
      priority: 'critical',
      devStatus: 'in-progress',
      refinementStage: 'ready',
      storyPoints: 13,
      businessValue: 10,
      effort: 13,
      sprintId: 'sprint-4',
      assignee: 'Mike Torres',
      tags: JSON.stringify(['Backend', 'Payment', 'Security']),
      dependenciesReviewed: true,
      qualityScore: 90,
      position: 10,
      acceptanceCriteria: [
        { id: 'ac-010-1', given: 'the user is on the payment step of checkout', when: 'the user enters valid card details and submits', then: 'the system should process the payment through the payment gateway and display a success confirmation', completed: false, testability: 'good' },
        { id: 'ac-010-2', given: 'the payment gateway returns a failure response', when: 'the user attempts to complete payment', then: 'the system should display a user-friendly error message and allow the user to retry or use a different payment method', completed: false, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-009', title: 'Checkout Process', type: 'depends-on' }],
      activityLog: [
        { field: 'status', description: 'Status changed to In Progress', oldValue: 'under-review', newValue: 'in-progress', author: 'Mike Torres' },
      ],
    },
    {
      id: 'US-011',
      title: 'Order Tracking',
      asA: 'customer',
      iWant: 'to track the status of my order in real-time',
      soThat: 'I can know when to expect delivery and monitor shipping progress',
      priority: 'medium',
      devStatus: 'draft',
      refinementStage: 'under-review',
      storyPoints: 5,
      businessValue: 7,
      effort: 5,
      sprintId: 'sprint-4',
      assignee: 'James Liu',
      tags: JSON.stringify(['Frontend', 'Backend', 'Notifications']),
      dependenciesReviewed: true,
      qualityScore: 80,
      position: 11,
      acceptanceCriteria: [
        { id: 'ac-011-1', given: 'the user has placed an order', when: 'the user navigates to the order tracking page', then: 'the system should display the current order status with a visual progress timeline', completed: true, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-009', title: 'Checkout Process', type: 'depends-on' }],
      activityLog: [
        { field: 'ac-added', description: 'Acceptance criterion added', newValue: 'Order status timeline', author: 'Alex Kim' },
      ],
    },
    {
      id: 'US-012',
      title: 'Notification Preferences',
      asA: 'registered user',
      iWant: 'to manage my notification preferences for emails and push alerts',
      soThat: 'I only receive communications that are relevant and useful to me',
      priority: 'low',
      devStatus: 'draft',
      refinementStage: 'draft',
      storyPoints: 3,
      businessValue: 4,
      effort: 3,
      sprintId: null,
      assignee: null,
      tags: JSON.stringify(['Frontend', 'Notifications', 'UI/UX']),
      dependenciesReviewed: false,
      qualityScore: 60,
      position: 12,
      acceptanceCriteria: [
        { id: 'ac-012-1', given: 'the user navigates to notification settings', when: 'the user toggles a notification category off', then: 'the system should save the preference and stop sending notifications of that type', completed: false, testability: 'good' },
      ],
      dependencies: [],
      activityLog: [],
    },
    {
      id: 'US-013',
      title: 'Admin Dashboard',
      asA: 'platform administrator',
      iWant: 'to view key operational metrics including user counts, revenue, and active orders',
      soThat: 'I can monitor platform health and make data-driven decisions',
      priority: 'high',
      devStatus: 'draft',
      refinementStage: 'needs-refinement',
      storyPoints: 8,
      businessValue: 8,
      effort: 8,
      sprintId: 'sprint-4',
      assignee: 'Alex Kim',
      tags: JSON.stringify(['Admin', 'Reporting', 'Backend']),
      dependenciesReviewed: false,
      qualityScore: 70,
      position: 13,
      acceptanceCriteria: [
        { id: 'ac-013-1', given: 'the administrator logs in to the admin dashboard', when: 'the dashboard page loads', then: 'the system should display real-time metrics including total users, active orders, and daily revenue', completed: false, testability: 'good' },
      ],
      dependencies: [],
      activityLog: [
        { field: 'priority', description: 'Priority changed to High', oldValue: 'medium', newValue: 'high', author: 'Sarah Chen' },
      ],
    },
    {
      id: 'US-014',
      title: 'Audit Logging',
      asA: 'system administrator',
      iWant: 'to view a comprehensive audit log of all significant system actions',
      soThat: 'I can ensure platform security and investigate any suspicious activity',
      priority: 'high',
      devStatus: 'draft',
      refinementStage: 'draft',
      storyPoints: 0,
      businessValue: 7,
      effort: 8,
      sprintId: null,
      assignee: null,
      tags: JSON.stringify(['Security', 'Backend', 'Admin']),
      dependenciesReviewed: false,
      qualityScore: 40,
      position: 14,
      acceptanceCriteria: [],
      dependencies: [{ targetStoryId: 'US-013', title: 'Admin Dashboard', type: 'depends-on' }],
      activityLog: [],
    },
    {
      id: 'US-015',
      title: 'Two-Factor Authentication',
      asA: 'security-conscious user',
      iWant: 'to enable two-factor authentication on my account',
      soThat: 'I can protect my account from unauthorized access even if my password is compromised',
      priority: 'high',
      devStatus: 'draft',
      refinementStage: 'needs-refinement',
      storyPoints: 8,
      businessValue: 9,
      effort: 8,
      sprintId: 'sprint-4',
      assignee: 'Mike Torres',
      tags: JSON.stringify(['Security', 'Authentication', 'Backend']),
      dependenciesReviewed: true,
      qualityScore: 85,
      position: 15,
      acceptanceCriteria: [
        { id: 'ac-015-1', given: 'the user is logged in and navigates to security settings', when: 'the user enables two-factor authentication', then: 'the system should generate a TOTP secret and display a QR code for authenticator app setup', completed: false, testability: 'good' },
        { id: 'ac-015-2', given: 'the user has 2FA enabled', when: 'the user logs in with valid credentials', then: 'the system should require a valid 6-digit TOTP code before granting access', completed: false, testability: 'good' },
      ],
      dependencies: [{ targetStoryId: 'US-002', title: 'User Login', type: 'depends-on' }],
      activityLog: [
        { field: 'ac-added', description: '2 acceptance criteria added', author: 'Alex Kim' },
      ],
    },
  ];

  for (const s of storiesData) {
    const { acceptanceCriteria, dependencies, activityLog, ...storyFields } = s;

    await prisma.userStory.upsert({
      where: { id: s.id },
      update: storyFields,
      create: storyFields,
    });

    // Delete existing child records to allow idempotent re-seeding
    await prisma.acceptanceCriterion.deleteMany({ where: { storyId: s.id } });
    if (acceptanceCriteria.length > 0) {
      await prisma.acceptanceCriterion.createMany({
        data: acceptanceCriteria.map((ac) => ({ ...ac, storyId: s.id })),
      });
    }

    await prisma.storyDependency.deleteMany({ where: { storyId: s.id } });
    if (dependencies.length > 0) {
      await prisma.storyDependency.createMany({
        data: dependencies.map((d) => ({ ...d, storyId: s.id })),
      });
    }

    await prisma.storyActivity.deleteMany({ where: { storyId: s.id } });
    if (activityLog.length > 0) {
      await prisma.storyActivity.createMany({
        data: activityLog.map((act) => ({ ...act, storyId: s.id })),
      });
    }
  }

  console.log(`[Seed] ${storiesData.length} stories successfully seeded.`);
  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
