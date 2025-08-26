import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';
import { PrismaClient } from '@prisma/client';

export type AppAbility = PureAbility<[string, string]>;

const prisma = new PrismaClient();

export async function defineAbilitiesFor(userId: number): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<PureAbility<[string, string]>>(PureAbility as AbilityClass<AppAbility>);

    const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            user_roles: {
                include: {
                    role: {
                        include: {
                            role_permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!userWithRoles || userWithRoles.user_roles.length === 0) {
        return build();
    }

    userWithRoles.user_roles.forEach((userRole: any) => {
        userRole.role.role_permissions.forEach((rolePermission: any) => {
            const { action, subject } = rolePermission.permission;
            can(action, subject);
        });
    });


    return build();
}
